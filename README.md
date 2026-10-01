# Amaral Escola de Música

Site e área do aluno da Amaral Escola de Música (Wenceslau Braz, PR).

- `index.html`: site de vendas (aulas, concursos, coral, professor, matrícula pelo WhatsApp)
- `aluno.html`: área do aluno (rotinas de estudo, progresso, comunidade e painel do professor)
- `config.js`: endereço e chave pública do projeto Supabase
- `canto.js`: tocador da área do aluno (piano na tela, braço do violão, metrônomo, vocalizes e acordes)
- `cursos.js`: cursos básicos prontos, 8 aulas por instrumento
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

## Cursos básicos e exercícios com som

- `cursos.js` traz 8 aulas para cada instrumento do cadastro (16 no Teclado: escalas, arpejos, blues, jazz e independência das mãos), mais a trilha **Teclado Profissional** (24 aulas: técnica nos 12 tons, voicings, ii-V-I, rearmonização, groove, ritmos brasileiros, gospel, percepção, Nashville, improvisação, banda, palco, estúdio e carreira): Canto coral, Teclado, Piano, Violão,
  Guitarra e Concurso (teoria e percepção). No painel do professor, **Cursos básicos prontos**
  cadastra cada curso com um clique. Cada aluno vê só as aulas do instrumento dele, na ordem.
- Um exercício pode ter som, guardado no item da rotina no campo `vocalize`, sem mudar o banco:
  vocalize (sobe de meio em meio tom), demonstração (escala, melodia, afinação), progressão de
  acordes (com desenho no braço para violão e guitarra), metrônomo, respiração com contagem ou
  teclado livre. Os tipos estão descritos no topo do `canto.js`.
- Nas aulas de Violão e Guitarra o som é de corda (violão de nylon e guitarra de aço) e tudo aparece
  no braço desenhado na tela: dedos de cada acorde, próximo acorde pontilhado e cada nota acendendo
  na corda e casa certas. O aluno também pode tocar clicando no braço.
- Piano e Teclado: as mãos aparecem desenhadas e o número do dedo fica em cada tecla (digitação escrita no
  exercício em `dedos`/`mao`/`maos`, ou calculada nos acordes).
- Exercícios de acordes mostram o **Mapa dos acordes**: para cada acorde, cifra, grau e função na tonalidade, desenho
  (teclado com dedos ou braço do violão) e a tabela nota por nota com dedo e função (3ª, 7ª, 9ª…). O cartão do
  acorde que está tocando fica destacado.
- O aluno só passa para o próximo exercício depois de praticar os minutos dele (o professor não tem trava).
- Para montar exercícios novos, use **Exercícios com piano e metrônomo** no formulário da rotina.
