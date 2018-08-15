---
title: "沉迷造轮子不能自拔：SMS-Decoder（短信解码库）"
date: 2018-03-09 23:32:35
id: csharp-sms-decoder
categories: projects
---

> A .NET / .NET Core library for parsing PDU-Mode SMS and decoding 7-bit, 8-bit, USC2 data.

GitHub：[wi1dcard/sms-decoder](https://github.com/wi1dcard/sms-decoder)

## Getting Started

Firstly, clone or download full source.

Then run:

```bash
cd sms-decoder
./test.sh
```

If you have a GPRS device (for example: SIM900A), you may connect it via serial, and modify `ser.py`:

```python
ser = serial.Serial("<YOUR_DEVICE_SERIAL>")
```

Make sure your divice is in [PDU-mode](https://www.diafaan.com/sms-tutorials/gsm-modem-tutorials/at-cmgf/), then run:

```bash
./test-at.sh
```

And send a sms from another divice or even cellphone.

You'll see the decoded sms.

## Usage

An easy way to use it in .NET (Core) is like:

```csharp
SmsDecoder.Helper.Decode (hexStrOrBytes);
```

But it's not support long sms which is split into many parts.

So, in production environments, you should use `MessagePool` just like:

```csharp
public static void onCompleteMsg (SmsDecoder.Message msg) {}
var pool = new SmsDecoder.MessagePool (onCompleteMsg);
pool.Add (SmsDecoder.Helper.Decode (...));
```

For full source, please reference to `test/Program.cs`.

## File Description

- `sms-decoder.sln`: .NET Core 2.0 solution file.
- `doc`: some useful document about pdu format.
- `lib`: library source code.
- `test`: a demo for this library.
- `test.sh`: includes some captcha sms sample to test decoding.
- `ser.py`: python script to connect GPRS device via serial.
- `test-at.sh`: build solution, simply parse AT commands from `ser.py`, and real-time decode sms'.

## License

`MIT`

## Thanks

Thanks for using, please star if helps. And do not hesitate to report any issue.

Hope you enjoy it.

![](https://jootu.org/zb_users/upload/2018/03/a474b40b77d32920d184d9cfd28278c5.png)

-- Wi1dcard