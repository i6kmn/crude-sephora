# Rouge Beauty

Aplicativo mobile de curadoria de cosméticos, inspirado na estética da Sephora, feito com React Native e Expo.

## Funcionalidades

- CRUD completo de produtos de maquiagem e skincare: criar, visualizar, editar e excluir.
- Campos de nome, categoria, marca, preço, descrição e URL da imagem.
- Busca por nome ou marca e filtro por categoria.
- Persistência local com `AsyncStorage`.
- Dados iniciais demonstrativos para o catálogo não começar vazio.

## Executar

```bash
npm install
npx expo start
```

Use o QR code no Expo Go ou os comandos abaixo para abrir em um alvo específico:

```bash
npm run android
npm run ios
npm run web
```

O catálogo fica salvo no dispositivo na chave local `@rouge-beauty/products`.