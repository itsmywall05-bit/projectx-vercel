# Excel RTD → Website Price Feed

This document explains how to send RTD/excel price updates from Excel into the Next.js app.

## Required fields in Excel

For the current API, send these fields from Excel:

- `product`: e.g. `CL`
- `anchor_month`: e.g. `Jul26`, `Aug26`, `Jan27`
- `symbol`: e.g. `CLN6`, `CLU7`
- `last`: the latest trade/last price
- `change`: the latest change value
- `settle`: the settlement price
- optionally `instrument`: a full label such as `CL Jul26 CLN6`

## How the app stores it

The website now stores inbound price data in memory with the following keys:

- `instrument` (if provided)
- `symbol` (if provided)
- `product anchor_month`
- `product anchor_month symbol`

Each stored record includes:

- `last`
- `change`
- `settle`
- `updated_at`

The live price lookup will use the `last` value as the current price.

## Excel VBA integration

Paste this macro into a VBA module in your workbook.

```vba
Option Explicit

Sub PostRtdPrices()
    Dim http As Object
    Dim rows As Long
    Dim json As String
    Dim r As Long
    Dim payloads As String
    Dim separator As String
    Dim hostUrl As String

    hostUrl = "https://your-deployment-url.vercel.app/api/prices"
    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")

    rows = ThisWorkbook.Worksheets("RTD_Data").Cells(Rows.Count, "A").End(xlUp).Row
    payloads = "["
    separator = ""

    For r = 2 To rows
        Dim product As String
        Dim anchorMonth As String
        Dim symbol As String
        Dim lastValue As Variant
        Dim changeValue As Variant
        Dim settleValue As Variant

        product = Trim(ThisWorkbook.Worksheets("RTD_Data").Cells(r, "A").Value)
        anchorMonth = Trim(ThisWorkbook.Worksheets("RTD_Data").Cells(r, "B").Value)
        symbol = Trim(ThisWorkbook.Worksheets("RTD_Data").Cells(r, "C").Value)
        lastValue = ThisWorkbook.Worksheets("RTD_Data").Cells(r, "D").Value
        changeValue = ThisWorkbook.Worksheets("RTD_Data").Cells(r, "E").Value
        settleValue = ThisWorkbook.Worksheets("RTD_Data").Cells(r, "F").Value

        If product <> "" And anchorMonth <> "" And symbol <> "" Then
            json = "{" & _
                """product"":""" & Replace(product, """", """"") & """ & _
                ",""anchor_month"":"""" & Replace(anchorMonth, """", """"") & """" & _
                ",""symbol"":"""" & Replace(symbol, """", """"") & """" & _
                ",""last"":" & FormatNumber(lastValue, 2, vbTrue, vbFalse, vbFalse) & _
                ",""change"":" & FormatNumber(changeValue, 2, vbTrue, vbFalse, vbFalse) & _
                ",""settle"":" & FormatNumber(settleValue, 2, vbTrue, vbFalse, vbFalse) & _
                "}"
            payloads = payloads & separator & json
            separator = ","
        End If
    Next r

    payloads = payloads & "]"

    If separator = "" Then
        MsgBox "No rows found to send.", vbInformation
        Exit Sub
    End If

    http.Open "POST", hostUrl, False
    http.setRequestHeader "Content-Type", "application/json"
    http.send payloads

    If http.Status = 200 Then
        MsgBox "Price feed sent successfully.", vbInformation
    Else
        MsgBox "Error sending prices: " & http.Status & " - " & http.responseText, vbExclamation
    End If
End Sub
```

### Worksheet layout example

Use a worksheet named `RTD_Data` with columns:

- Column A: `product`
- Column B: `anchor_month`
- Column C: `symbol`
- Column D: `last`
- Column E: `change`
- Column F: `settle`

Example row:

| product | anchor_month | symbol | last   | change | settle |
|---------|--------------|--------|--------|--------|--------|
| CL      | Jul26        | CLN6   | 96.20  | -0.15  | 96.10  |

## Important setup steps

1. Replace `https://your-deployment-url.vercel.app/api/prices` with your actual Vercel URL.
2. Make sure the worksheet is named `RTD_Data` or update the VBA code accordingly.
3. Use the `PostRtdPrices` macro after your RTD values refresh.
4. The endpoint accepts arrays of rows, so batching is OK.

## Optional instrument field

If Excel can build the full instrument label, you may include:

- `instrument`: `CL Jul26 CLN6`

Then the same row will be stored by instrument label as well as by `product anchor_month` and `product anchor_month symbol`.

## Tips

- Use `FormatNumber(..., 2)` to send safe numeric values.
- If the RTD data contains empty rows, the macro skips them.
- If you want update-only behavior, Excel can call the macro regularly via a timer or worksheet event.
