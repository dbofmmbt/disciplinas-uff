# Disciplinas UFF

Para rodar a ferramenta, você precisará de node, pnpm e selenium instalados. Provavelmente vai precisar instalar a versão do `chromedriver` compatível com seu navegador para conseguir extrair os dados.

Lembre-se de rodar `pnpm install` para instalar as dependências do projeto.

O comando `pnpm run extractor` vai usar os dados do arquivo `input.json` para acessar o quadro de horários e extrair as informações.

Exemplo de arquivo `input.json`:

```json
{
    "login": "string",
    "password": "string",
    "course": "Sistemas de Informação"
}
```

O comando `pnpm run calendar` vai exibir um calendário com base no json obtido na extração, que é salvo em `static/classrooms.json`. É recomendado que você limpe manualmente o JSON para remover as disciplinas que não importam para você nessa inscrição, para não poluir demais o calendário.
