# Modalità Ospite e Kiosk — Diomede Luxury

La PWA usa un unico progetto con due modalità.

## Modalità ospite (smartphone personale)
Apertura normale della PWA. Tutti i link esterni continuano a funzionare normalmente: WhatsApp, telefono, email, Google Maps e siti web.

Per forzare il ritorno alla modalità ospite sul dispositivo corrente:

`index.html?mode=guest`

## Modalità kiosk (tablet del B&B)
Aprire una volta:

`index.html?mode=kiosk`

La scelta viene memorizzata nel browser/PWA del tablet. I link interni continuano a navigare nella PWA; WhatsApp, telefono, email, Maps e siti esterni non escono dal kiosk e mostrano invece un QR code da scansionare con lo smartphone dell'ospite.

Il QR viene generato localmente dalla PWA e non richiede un servizio QR esterno.

Se i dati dell'app/browser vengono cancellati dal sistema MDM, riaprire l'URL con `?mode=kiosk`.
