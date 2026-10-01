# Amaral Escola de Música

Site e área do aluno da Amaral Escola de Música (Wenceslau Braz, PR).

- `index.html`: site de vendas (aulas, concursos, coral, professor, matrícula pelo WhatsApp)
- `aluno.html`: área do aluno (rotinas de estudo, progresso, comunidade e painel do professor)
- `config.js`: endereço e chave pública do projeto Supabase
- `canto.js`: piano na tela, metrônomo, tocador de vocalizes e as 4 aulas de canto prontas
- `supabase/schema.sql`: tabelas e regras de segurança do banco

## Ligar a área do aluno (uma vez)

1. Crie uma conta grátis em <https://supabase.com> (pode entrar com o GitHub) e um projeto novo.
   Região: **South America (São Paulo)**.
2. No projeto, abra **SQL Editor**, cole todo o `supabase/schema.sql` e clique em **Run**.
3. Em **Authentication → Sign In / Providers → Email**, desligue **Confirm email** (o envio de
   e-mails grátis do Supabase é bem limitado; quem controla a entrada é a aprovação do professor).
4. Em **Authentication → URL Configuration**, coloque em *Site URL* o endereço do site
   (ex.: `https://gardpardal.github.io/amaral-escola-de-musica/aluno.html`).
5. Em **Project Settings → API**, copie *Project URL* e a chave *anon public* para o `config.js`.
6. Crie sua conta pela área do aluno e rode no SQL Editor (com o seu e-mail):

   ```sql
   update public.perfis set papel = 'professor', aprovado = true
     where id = (select id from auth.users where email = 'SEU-EMAIL');
   ```

## Como funciona

- Alunos criam a conta e ficam **aguardando aprovação**. O professor aprova no painel.
- Só o professor publica rotinas. Cada aluno marca o que estudou **no dia** e vê o próprio
  progresso (sequência de dias, minutos, mapa de 12 semanas).
- Alunos não veem o progresso uns dos outros; o professor vê o de todos.
- A comunidade aceita texto e links `https://` (YouTube, Drive) para vídeos e áudios.

## Canto: vocalizes com piano

- Um exercício pode ter piano e metrônomo: vocalize (o piano toca o desenho e sobe de meio em meio
  tom), respiração com contagem ou teclado livre. Ele fica guardado no item da rotina, no campo
  `vocalize`, sem mudar o banco.
- No painel do professor: **Aulas de canto prontas → Adicionar as aulas** cadastra Respiração,
  Afinação, Resistência e Tessitura. Para montar outras, use **Exercícios com piano e metrônomo**
  no formulário da rotina.
- O aluno escolhe voz feminina ou masculina (uma oitava abaixo), o andamento e até onde subir.
