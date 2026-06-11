# L.A. Controle — App Android (Capacitor)

Empacota o **mesmo** `index.html` do motorista. O site no GitHub **não depende** desta pasta.

## Primeira vez

```powershell
cd la-controle-capacitor
npm install
copy ..\la-config.example.js www\la-config.js
# Edite www\la-config.js com sua ORS_KEY (ou copie de ..\la-config.js)
npm run cap:sync
npm run cap:open
```

No Android Studio: aguarde Gradle → Run no celular ou Build APK.

## Depois de mudar o app web

```powershell
npm run cap:sync
```

## Publicação Play (dia 5)

Gerar **AAB**: Android Studio → Build → Generate Signed Bundle / APK → Android App Bundle.

Ver `../CAPACITOR-PLANO.md`.
