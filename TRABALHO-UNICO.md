# L.A. Controle — pasta única

Tudo fica em **`veiculoexterno2/`** (Git + web + Android).

---

## Estrutura

```
veiculoexterno2/
├── index.html          App motorista
├── painel.html         Painel gestor
├── la-firebase.js      Firebase
├── la-integracao.js    Webhook plataforma L.A.
├── la-config.js        ORS + webhook (local, não vai pro Git)
├── database.rules.json Regras RTDB
├── docs/               Documentação (comece por PARA-O-MENTOR.md)
├── la-controle-capacitor/   APK Android
│   ├── www/            (gerado — não editar)
│   └── android/        Abrir no Android Studio
└── TRABALHO-UNICO.md   Este arquivo
```

**GitHub:** `Lucasweb2025/veiculoexterno2`

---

## Dia a dia

1. Editar `index.html` / `painel.html` na **raiz** desta pasta
2. Testar no navegador ou GitHub Pages
3. `git commit` + `git push`
4. APK (recomendado — fora do OneDrive):
   - Duplo-clique em **`BUILD-APK.bat`** na raiz
   - Ou manualmente: copiar para `C:\Projetos\veiculoexterno2` → `npm run cap:sync` → abrir `android/` no Studio

---

## Branches (backup)

| Branch | Uso |
|--------|-----|
| `main` | Estável — Pages publica daqui |
| `teste` | Experimentos |

```bash
git checkout -b teste
git checkout main
```

---

## Pasta antiga (pode apagar)

Se ainda existir:

`TESTEMOSTRAMAPA/Nova pasta/`

Feche o **Android Studio**, depois apague essa pasta inteira no Explorer.

---

## Build sem OneDrive travar

Se o Gradle falhar no OneDrive, copie só `la-controle-capacitor` para `C:\Projetos\` e abra o `android/` de lá.
