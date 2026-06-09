' ============================================================
'  projectX Price Feed — Excel → Vercel Bridge  v1.0
'  Module name: RTD_VercelBridge
'
'  HOW TO INSTALL:
'    Alt+F11 → Insert > Module → rename to "RTD_VercelBridge"
'    Paste this file. Save as macro-enabled workbook (.xlsm).
'
'  PUBLIC COMMANDS (run via Alt+F8):
'    StartAutoPush    — begin automatic push on PUSH_INTERVAL_SECS
'    StopAutoPush     — halt automatic push
'    PushNow          — single manual push
'    BridgeStatus     — show running state, push count, last result
'    RemoveExpiredRows — delete all EXPIRED rows from the sheet
'    Shutdown         — silent stop (no dialog)
' ============================================================

Option Explicit

' ── ENDPOINT ────────────────────────────────────────────────
' Comment out one of the two lines below to switch target.
Private Const API_URL As String = "https://projectx-vercel.vercel.app/api/prices"
' Private Const API_URL As String = "http://localhost:3000/api/prices"

' ── AUTH (optional) ─────────────────────────────────────────
' Leave empty if the endpoint has no bearer-token guard.
Private Const API_SECRET As String = ""

' ── TIMING ──────────────────────────────────────────────────
Private Const PUSH_INTERVAL_SECS As Long = 20   ' seconds between auto-pushes
Private Const PUSH_TIMEOUT_MS    As Long = 8000 ' HTTP timeout in ms

' ── SHEET ───────────────────────────────────────────────────
Private Const SHEET_RTD As String = "RTD_Data"  ' sheet that holds the price table
Private Const HDR_ROW   As Integer = 3          ' header row (data starts at HDR_ROW+1)

' ── COLUMN CONFIG ───────────────────────────────────────────
' Integer = column number (A=1, B=2, ...).
' To SKIP a field: set its constant to 0.
' To ADD a field: add a Const here and handle it in BuildRow().
Private Const COL_PROD   As Integer = 1    ' A  Product Code       ← required
Private Const COL_ANCH   As Integer = 3    ' C  Anchor Month       ← required
Private Const COL_EXCH   As Integer = 5    ' E  Exchange
Private Const COL_STAT   As Integer = 8    ' H  Status (ACTIVE / EXPIRED)  ← filter
Private Const COL_LAST   As Integer = 10   ' J  Last               ← required (must be numeric)
Private Const COL_CHANGE As Integer = 15   ' O  Change
Private Const COL_SETTLE As Integer = 19   ' S  Settle

' ── STATE ───────────────────────────────────────────────────
Private m_Running    As Boolean
Private m_NextFire   As Date
Private m_PushCount  As Long
Private m_LastStatus As String

' ============================================================
'  PUBLIC INTERFACE
' ============================================================

Public Sub StartAutoPush()
    If m_Running Then
        MsgBox "Auto-push already running." & vbCrLf & _
               "Use StopAutoPush first, or check BridgeStatus.", _
               vbInformation, "projectX Bridge"
        Exit Sub
    End If
    m_Running = True
    m_PushCount = 0
    m_LastStatus = "NEVER"
    TimerTick
    MsgBox "Auto-push started." & vbCrLf & vbCrLf & _
           "Endpoint : " & API_URL & vbCrLf & _
           "Interval : every " & PUSH_INTERVAL_SECS & " seconds.", _
           vbInformation, "projectX Bridge"
End Sub

Public Sub StopAutoPush()
    If Not m_Running Then
        MsgBox "Auto-push is not running.", vbInformation, "projectX Bridge"
        Exit Sub
    End If
    m_Running = False
    On Error Resume Next
    Application.OnTime m_NextFire, "RTD_VercelBridge.TimerTick", , False
    On Error GoTo 0
    MsgBox "Auto-push stopped." & vbCrLf & "Total pushes sent: " & m_PushCount, _
           vbInformation, "projectX Bridge"
End Sub

Public Sub BridgeStatus()
    MsgBox "Status  : " & IIf(m_Running, "RUNNING", "STOPPED") & vbCrLf & _
           "Pushes  : " & m_PushCount & vbCrLf & _
           "Last    : " & m_LastStatus & vbCrLf & vbCrLf & _
           "Endpoint: " & API_URL, _
           vbInformation, "projectX Bridge"
End Sub

Public Sub PushNow()
    Dim result As String
    result = DoPush()
    MsgBox "Push result: " & result, _
           IIf(Left(result, 2) = "OK", vbInformation, vbExclamation), _
           "projectX Bridge"
End Sub

Public Sub Shutdown()
    m_Running = False
    On Error Resume Next
    Application.OnTime m_NextFire, "RTD_VercelBridge.TimerTick", , False
    On Error GoTo 0
End Sub

Public Sub TimerTick()
    If Not m_Running Then Exit Sub
    m_LastStatus = DoPush()
    m_PushCount = m_PushCount + 1
    m_NextFire = Now + TimeSerial(0, 0, PUSH_INTERVAL_SECS)
    Application.OnTime m_NextFire, "RTD_VercelBridge.TimerTick"
End Sub

' ============================================================
'  REMOVE EXPIRED ROWS UTILITY
' ============================================================

Public Sub RemoveExpiredRows()
    Dim ws As Worksheet
    Dim lastRow As Long, r As Long, deleteCount As Long

    Set ws = ThisWorkbook.Worksheets(SHEET_RTD)
    lastRow = ws.Cells(ws.Rows.Count, COL_PROD).End(xlUp).Row

    deleteCount = 0
    For r = HDR_ROW + 1 To lastRow
        If UCase(Trim(CStr(ws.Cells(r, COL_STAT).Value))) = "EXPIRED" Then
            deleteCount = deleteCount + 1
        End If
    Next r

    If deleteCount = 0 Then
        MsgBox "No EXPIRED rows found.", vbInformation, "projectX Bridge"
        Exit Sub
    End If

    If MsgBox(deleteCount & " EXPIRED rows will be deleted permanently." & vbCrLf & _
              "Continue?", vbYesNo + vbExclamation, "projectX Bridge") <> vbYes Then Exit Sub

    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual
    For r = lastRow To HDR_ROW + 1 Step -1
        If UCase(Trim(CStr(ws.Cells(r, COL_STAT).Value))) = "EXPIRED" Then ws.Rows(r).Delete
    Next r
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True

    MsgBox deleteCount & " EXPIRED rows deleted.", vbInformation, "projectX Bridge"
End Sub

' ============================================================
'  CORE PUSH LOGIC
' ============================================================

Private Function DoPush() As String
    Dim ws As Worksheet
    Dim lastRow As Long, r As Long, rowCount As Long
    Dim rowsJson As String, payload As String

    On Error GoTo ErrHandler
    Set ws = ThisWorkbook.Worksheets(SHEET_RTD)
    lastRow = ws.Cells(ws.Rows.Count, COL_PROD).End(xlUp).Row

    rowsJson = ""
    rowCount = 0

    For r = HDR_ROW + 1 To lastRow
        ' Skip non-ACTIVE rows
        If UCase(Trim(CStr(ws.Cells(r, COL_STAT).Value))) <> "ACTIVE" Then GoTo NextRow

        Dim obj As String
        obj = BuildRow(ws, r)
        If obj = "" Then GoTo NextRow

        If rowCount > 0 Then rowsJson = rowsJson & "," & vbNewLine
        rowsJson = rowsJson & "  " & obj
        rowCount = rowCount + 1
NextRow:
    Next r

    If rowCount = 0 Then
        DoPush = "ERROR: No ACTIVE rows with valid data found."
        Exit Function
    End If

    payload = "[" & vbNewLine & rowsJson & vbNewLine & "]"
    DoPush = HttpPost(API_URL, payload)
    Exit Function

ErrHandler:
    DoPush = "ERROR: " & Err.Description
End Function

' ============================================================
'  BUILD A SINGLE ROW AS A JSON OBJECT
'  Add/remove fields here to match COLUMN CONFIG above.
' ============================================================

Private Function BuildRow(ws As Worksheet, r As Long) As String
    Dim prod As String, anch As String

    ' Required fields — skip row if either is missing
    prod = Trim(CStr(ws.Cells(r, COL_PROD).Value))
    anch = Trim(CStr(ws.Cells(r, COL_ANCH).Value))
    If prod = "" Or anch = "" Then
        BuildRow = ""
        Exit Function
    End If

    ' Required numeric — skip row if Last is not a number
    Dim lastVal As Variant
    lastVal = ws.Cells(r, COL_LAST).Value
    If Not IsNumeric(lastVal) Or lastVal = "" Then
        BuildRow = ""
        Exit Function
    End If

    Dim obj As String
    obj = "{"
    obj = obj & Q("product") & ":" & Q(Esc(prod))
    obj = obj & "," & Q("anchor_month") & ":" & Q(Esc(anch))
    obj = obj & "," & Q("last") & ":" & CStr(CDbl(lastVal))

    ' Optional: Exchange
    If COL_EXCH > 0 Then
        Dim exch As String
        exch = Trim(CStr(ws.Cells(r, COL_EXCH).Value))
        If exch <> "" Then obj = obj & "," & Q("exchange") & ":" & Q(Esc(exch))
    End If

    ' Optional: Change
    If COL_CHANGE > 0 Then
        Dim chgVal As Variant
        chgVal = ws.Cells(r, COL_CHANGE).Value
        If IsNumeric(chgVal) And chgVal <> "" Then
            obj = obj & "," & Q("change") & ":" & CStr(CDbl(chgVal))
        Else
            obj = obj & "," & Q("change") & ":null"
        End If
    End If

    ' Optional: Settle
    If COL_SETTLE > 0 Then
        Dim setVal As Variant
        setVal = ws.Cells(r, COL_SETTLE).Value
        If IsNumeric(setVal) And setVal <> "" Then
            obj = obj & "," & Q("settle") & ":" & CStr(CDbl(setVal))
        Else
            obj = obj & "," & Q("settle") & ":null"
        End If
    End If

    obj = obj & "}"
    BuildRow = obj
End Function

' ============================================================
'  HTTP
' ============================================================

Private Function HttpPost(url As String, jsonBody As String) As String
    Dim http As Object
    On Error GoTo HttpErr

    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    http.Open "POST", url, False
    http.setTimeouts PUSH_TIMEOUT_MS, PUSH_TIMEOUT_MS, PUSH_TIMEOUT_MS, PUSH_TIMEOUT_MS
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "Accept", "application/json"
    http.setRequestHeader "User-Agent", "projectX-ExcelBridge/1.0"

    If Len(Trim(API_SECRET)) > 0 Then
        http.setRequestHeader "Authorization", "Bearer " & API_SECRET
    End If

    http.send jsonBody

    Select Case http.Status
        Case 200, 201, 204: HttpPost = "OK (HTTP " & http.Status & ")"
        Case 400:            HttpPost = "ERROR: Bad request (400) — " & Left(http.responseText, 120)
        Case 401, 403:       HttpPost = "ERROR: Auth failed (" & http.Status & ")"
        Case 404:            HttpPost = "ERROR: Endpoint not found (404) — check API_URL"
        Case 429:            HttpPost = "ERROR: Rate limited (429)"
        Case Else:           HttpPost = "ERROR: HTTP " & http.Status & " — " & Left(http.responseText, 120)
    End Select
    Exit Function

HttpErr:
    HttpPost = "ERROR: " & Err.Description
End Function

' ============================================================
'  HELPERS
' ============================================================

Private Function Q(s As String) As String
    Q = """" & s & """"
End Function

Private Function Esc(s As String) As String
    s = Replace(s, "\",  "\\")
    s = Replace(s, """", "\""")
    s = Replace(s, vbCrLf, "\n")
    s = Replace(s, vbCr,   "\n")
    s = Replace(s, vbLf,   "\n")
    s = Replace(s, vbTab,  "\t")
    Esc = s
End Function
