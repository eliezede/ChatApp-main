export const questions = [
    // RISK BLOCK
    {
        id: 'q4',
        block: 'risk',
        question: 'Com que frequência você consome pornografia ou conteúdo hiperstimulante?',
        options: ['Nunca', 'Raramente', '1-2 vezes por semana', 'Diariamente', 'Múltiplas vezes ao dia'],
        weights: [0, 2, 5, 8, 10]
    },
    {
        id: 'q6',
        block: 'risk',
        question: 'Você teve episódios de perda de controle emocional ou "recaídas" nos últimos 30 dias?',
        options: ['Nenhum', '1 episódio', '2-3 episódios', 'Frequente (semanal)', 'Quase diário'],
        weights: [0, 3, 6, 8, 10]
    },
    {
        id: 'q7',
        block: 'risk',
        question: 'Qual o seu nível de exposição a ambientes ou pessoas que prejudicam sua disciplina?',
        options: ['Baixo/Nenhum', 'Moderado', 'Alto', 'Incontrolável'],
        weights: [0, 4, 8, 10]
    },

    // STABILITY BLOCK
    {
        id: 'q8',
        block: 'stability',
        type: 'scale',
        question: 'Em uma escala de 0 a 10, quão estável você sente seu humor hoje?',
    },
    {
        id: 'q9',
        block: 'stability',
        type: 'scale',
        question: 'De 0 a 10, quão bem você tem dormido ultimamente?',
    },
    {
        id: 'q10',
        block: 'stability',
        type: 'scale',
        question: 'De 0 a 10, qual o seu nível de ansiedade diária? (10 é o mais alto)',
    },
    {
        id: 'q11',
        block: 'stability',
        type: 'scale',
        question: 'De 0 a 10, quão presente você consegue estar nas suas tarefas?',
    },
    {
        id: 'q22',
        block: 'stability',
        type: 'scale',
        question: 'De 0 a 10, quão satisfeito você está com sua clareza mental?',
    },

    // STRUCTURE BLOCK
    {
        id: 'q14',
        block: 'structure',
        question: 'Como você descreveria sua rotina de trabalho/estudo?',
        options: ['Totalmente caótica', 'Tenho horários, mas não sigo', 'Sigo parcialmente', 'Muito estruturada'],
        weights: [0, 3, 7, 10]
    },
    {
        id: 'q16',
        block: 'structure',
        question: 'Você planeja o seu dia no dia anterior ou na mesma manhã?',
        options: ['Nunca planejo', 'Planejo mentalmente', 'Anoto as vezes', 'Sempre planejo'],
        weights: [0, 4, 7, 10]
    },

    // DISCIPLINE BLOCK
    {
        id: 'goal',
        block: 'discipline',
        question: 'Qual o seu foco principal agora?',
        options: ['Reconstrução Física', 'Estabilidade Mental', 'Disciplina e Estrutura'],
    },
    {
        id: 'time',
        block: 'discipline',
        question: 'Quanto tempo você pode dedicar por dia?',
        options: ['15-30 min', '30-60 min', 'Mais de 1 hora'],
    },
];
