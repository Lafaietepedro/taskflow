# TaskFlow Field Mobile

Base mobile do produto em Expo consumindo a mesma API do projeto web.

## O que ja existe

- login integrado com `/api/v1/auth/login`
- sessão persistida com `expo-secure-store`
- listagem de ordens usando a mesma API do painel web
- busca por cliente, endereço, checklist e texto da ordem
- filtros por status
- navegação entre lista, detalhe da ordem e perfil
- atualização de status no celular
- checklist interativo no detalhe da visita
- ações rápidas no detalhe da ordem: ligação, rota no mapa e WhatsApp quando houver telefone/endereço
- cache offline básico com `AsyncStorage` para exibir a última sincronização quando a API falhar
- fila de sincronização offline para status e checklist feitos sem conexão
- lembretes locais com `expo-notifications` para ordens pendentes do dia
- comprovante de execução com foto via câmera ou galeria
- botão de acesso com conta demo compartilhada com o painel web
- configuração por `EXPO_PUBLIC_API_URL`

## Versão do Expo

Este app está em **Expo SDK 54** para manter compatibilidade direta com o Expo Go instalado pela Play Store/App Store durante o desenvolvimento.

O SDK 55 existe, mas no período de transição do SDK 55 o Expo Go das lojas pode ainda não abrir projetos nessa versão em alguns dispositivos. Quando o produto estiver pronto para uma etapa mais próxima de publicação, o caminho recomendado será criar um development build com EAS.

## Como rodar

```bash
cd mobile
cp .env.example .env
npm install
npm run start
```

## Como testar em desenvolvimento

1. Suba o backend em outro terminal:

```bash
cd backend
npm run dev
```

2. Configure a URL da API em `mobile/.env` conforme o alvo:

```bash
# Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:5001/api/v1

# iOS Simulator
EXPO_PUBLIC_API_URL=http://localhost:5001/api/v1

# Expo Go em celular físico na mesma rede Wi-Fi
EXPO_PUBLIC_API_URL=http://SEU_IP_DA_REDE:5001/api/v1
EXPO_PUBLIC_DEMO_ACCOUNT_ENABLED=true
EXPO_PUBLIC_DEMO_USERNAME=demo@taskflow.com
EXPO_PUBLIC_DEMO_PASSWORD=taskflow123
```

Se você usa `npm run mobile:tunnel`, lembre que o tunnel do Expo expõe apenas o bundle do app. O backend continua precisando estar acessível pelo celular. Na prática, use `EXPO_PUBLIC_API_URL` com o IP da máquina na rede local ou exponha também o backend por um tunnel separado.

3. Para celular físico, ajuste o backend para aceitar conexões da rede local:

```bash
# backend/.env
HOST=0.0.0.0
PORT=5001
```

4. Inicie o app:

```bash
cd mobile
npm run start
```

No Expo, pressione `a` para Android Emulator, `i` para iOS Simulator ou escaneie o QR Code com o Expo Go.

Também é possível iniciar a partir da raiz do repositório:

```bash
npm run mobile:lan
```

Se a rede local bloquear a conexão, tente o modo tunnel:

```bash
npm run mobile:tunnel
```

Se o tunnel falhar com `remote gone away`, tente rodar o Expo diretamente dentro da pasta mobile:

```bash
cd mobile
npx expo start --tunnel -c
```

O tunnel usa ngrok por baixo dos panos. Por isso, mesmo com o projeto correto, ele pode falhar por instabilidade externa, bloqueio de rede, VPN ou proxy.

### Erro: Failed to download remote update

Esse erro normalmente significa que o Expo Go leu o QR Code, mas não conseguiu baixar o bundle do Metro.

Checklist rapido:

- Rode o Expo dentro de `mobile/`, não na raiz do projeto web.
- Se estiver na raiz do repositorio, use `npm run mobile:lan`.
- Celular e computador precisam estar na mesma rede Wi-Fi quando usar `--lan`.
- Desative VPN/proxy/firewall temporariamente se o celular não acessar o computador.
- Abra no navegador do celular `http://SEU_IP:5001/health` para confirmar que a API está visível na rede.
- Se o LAN continuar falhando, use `npm run mobile:tunnel`.
- Depois de mudar `.env`, pare o Expo e rode novamente com cache limpo.

### Erro de Network ao logar

No Expo Go, `localhost` aponta para o próprio celular, não para o computador. Se o login falhar com erro de network:

- confirme que `backend/.env` tem `HOST=0.0.0.0` e `PORT=5001`
- abra no navegador do celular `http://SEU_IP:5001/health`
- coloque em `mobile/.env`: `EXPO_PUBLIC_API_URL=http://SEU_IP:5001/api/v1`
- reinicie o Expo com `npm run mobile:lan` ou `npm run mobile:tunnel`

Se `http://SEU_IP:5001/health` não abrir no celular, o problema ainda é rede/firewall/backend, não login.

## Preview com MobileView

A extensão MobileView consegue abrir o preview web do app mobile. Ela não substitui um emulador/celular real para câmera, notificações e APIs nativas, mas é ótima para revisar layout e fluxo rapidamente.

1. Suba o backend:

```bash
cd backend
npm run dev
```

2. Em outro terminal, suba o preview web do mobile:

```bash
cd mobile
npm run preview:web
```

3. Abra a MobileView apontando para:

```bash
http://localhost:8082
```

Use `localhost`, não `127.0.0.1`, porque o Expo pode escutar apenas no localhost IPv6 dependendo do ambiente.

## Observações

- Esta base foi criada manualmente para encaixar no monorepo atual.
- A documentação oficial do Expo recomenda iniciar novos projetos com `npx create-expo-app@latest --template default@sdk-55` na fase atual do SDK 55.
- A persistência local usa `expo-secure-store`, conforme a documentação oficial: https://docs.expo.dev/versions/v55.0.0/sdk/securestore/
- O cache de ordens usa `@react-native-async-storage/async-storage` para leitura offline e para guardar a fila de alterações locais.
- Quando a API volta, tocar em `Atualizar ordens` tenta enviar as pendências antes de buscar a lista nova.
- Os lembretes atuais são notificações locais. Push remoto com tokens de dispositivo ainda exige backend e credenciais das lojas.
- `expo-notifications` fica desativado no Expo Go para evitar avisos falsos; valide notificações em development build.
- Os comprovantes atuais trafegam como imagem compactada em `base64`. Para produção, o caminho natural é trocar por upload em storage.

## Proximos passos fortes

- push remoto com tokens Expo/APNs/FCM
- captura de foto e comprovação de execução
- upload de comprovantes para storage externo
- tratamento de conflitos quando a mesma ordem for editada em dois dispositivos
