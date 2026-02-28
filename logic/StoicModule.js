/**
 * Módulo de Ação e Estoicismo
 * Resiliência através da ação e aceitação radical.
 */

export const stoicExercises = [
    {
        id: 'amor_fati',
        title: 'Amor Fati',
        description: 'Aceite o que aconteceu como necessário para seu crescimento. O que isso te permite fazer agora?',
        type: 'STOIC_RESILIENCE'
    },
    {
        id: 'control_dichotomy',
        title: 'Dicotomia do Controle',
        description: 'Liste o que você pode controlar hoje (seu treino, seu trabalho) e o que não pode (sentimentos dela).',
        type: 'STOIC_LOGIC'
    }
];

export const bdnfMeta = {
    id: 'aerobic_stimulus',
    title: 'Estímulo de BDNF',
    description: '30 min de caminhada rápida ou corrida. Essencial para criar novas vias neurais.',
    neuroscience: 'O exercício aeróbico aumenta o BDNF, facilitando a neuroplasticidade e a cura emocional.',
    type: 'PHYSICAL_RESILIENCE'
};

export const getStoicExercise = () => {
    const randomIndex = Math.floor(Math.random() * stoicExercises.length);
    return stoicExercises[randomIndex];
};
