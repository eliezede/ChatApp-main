/**
 * Módulo de Reavaliação Cognitiva (CBT/TCC)
 * Focado na diminuição da atenção motivada e regulação emocional.
 */

export const cbtTasks = [
    {
        id: 'neg_reappraisal_list',
        title: 'Inventário de Realidade',
        description: 'Liste 3 hábitos ou características da sua ex que eram incompatíveis com seu futuro.',
        neuroscience: 'Focar em traços negativos reduz a ativação do sistema de recompensa associado ao ex.',
        type: 'CBT_REAPPRAISAL'
    },
    {
        id: 'narrative_shift',
        title: 'Fato vs Narrativa',
        description: 'Escreva um fato doloroso e depois reescreva-o sem a carga emocional (apenas os eventos).',
        neuroscience: 'A reestruturação narrativa ajuda a mover a memória do sistema límbico para o córtex pré-frontal.',
        type: 'CBT_RESTRUCTURING'
    }
];

export const generateCBTTask = (phase) => {
    // Return a random task from the pool based on phase
    const randomIndex = Math.floor(Math.random() * cbtTasks.length);
    return cbtTasks[randomIndex];
};
