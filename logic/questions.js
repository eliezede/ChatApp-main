export const questions = [
    // PHASE 1: GRIEF / TIME
    {
        id: 'timeframe',
        block: 'stability',
        question: 'Há quanto tempo ocorreu o término?',
        options: [
            'Menos de 1 mês',
            'Entre 1 e 3 meses',
            'Entre 3 e 6 meses',
            'Mais de 6 meses'
        ],
        weights: [10, 7, 4, 2]
    },

    // PHASE 2: PAIN POINTS
    {
        id: 'pain_points',
        block: 'risk',
        question: 'Qual tem sido o seu maior desafio no momento?',
        type: 'multiple', // Handled in Questionnaire.js
        options: [
            'Pensamentos obsessivos',
            'Vontade de mandar mensagem/redes sociais',
            'Sentimento de raiva ou injustiça',
            'Sensação de vazio ou perda de identidade',
            'Dificuldade para dormir ou focar'
        ],
        weights: [8, 10, 6, 7, 5]
    },

    // PHASE 3: GOALS
    {
        id: 'main_goal',
        block: 'discipline',
        question: 'Qual é o seu principal objetivo com o nosso app?',
        options: [
            'Manter o Contato Zero com sucesso',
            'Recuperar minha autoestima e confiança',
            'Entender o que deu errado (Padrões de Apego)',
            'Focar em mim (Treino, hobbies)'
        ],
        weights: [10, 8, 6, 9]
    }
];
