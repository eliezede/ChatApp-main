export const MISSION_CATEGORIES = [
    { id: 'detox', label: 'DESINTOXICAÇÃO', icon: 'leak', color: '#f43f5e' },
    { id: 'action', label: 'AÇÃO & CORPO', icon: 'lightning-bolt', color: '#22c55e' },
    { id: 'stoic', label: 'MENTE ESTOICA', icon: 'head-heart', color: '#3b82f6' },
    { id: 'identity', label: 'AUTOEXPANSÃO', icon: 'compass-outline', color: '#a855f7' }
];

export const MISSIONS_LIBRARY = [
    // CATEGORY 1: Desintoxicação e "Higiene Digital"
    {
        id: 'detox_01',
        category: 'detox',
        title: '24 Horas de Silêncio Digital',
        difficulty: 'Easy',
        duration: '24h',
        science_fact: 'Sobreviver 24 horas sem olhar as redes sociais dela. Vitória rápida para ganhar tração e quebrar o ciclo de busca por dopamina.',
        logic: 'O cérebro apaixonado age como um dependente. Ver fotos dela reinicia o ciclo de abstinência. Evitar isso é o primeiro passo para a extinção neural.',
        image: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'detox_02',
        category: 'detox',
        title: 'Política da Terra Arrasada',
        difficulty: 'Medium',
        duration: '15 min',
        science_fact: 'Ocultar, silenciar ou bloquear a ex em todas as plataformas.',
        logic: 'Isso não é imaturidade, mas uma tática de higiene mental prática para eliminar gatilhos visuais que disparam o cortisol.',
        image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'detox_03',
        category: 'detox',
        title: 'O Purgatório Digital',
        difficulty: 'Hard',
        duration: '30 min',
        science_fact: 'Arquivar ou apagar fotos antigas do casal do rolo de câmera.',
        logic: 'Isso evita a reativação cognitiva intrusiva controlada por memórias visuais que impedem o cérebro de seguir em frente.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'detox_04',
        category: 'detox',
        title: 'Contato Zero Absoluto (3 Dias)',
        difficulty: 'Hard',
        duration: '3 dias',
        science_fact: 'Zero mensagens, zero likes, zero notícias através de terceiros.',
        logic: 'O contato zero é a única forma de permitir que os níveis de dopamina e oxitocina se estabilizem após o "choque" do término.',
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop'
    },

    // CATEGORY 2: Ação, Corpo e Neuroplasticidade
    {
        id: 'action_01',
        category: 'action',
        title: 'Suar por 20 Minutos',
        difficulty: 'Medium',
        duration: '20 min',
        science_fact: 'Qualquer exercício intenso: corrida, musculação ou funcional.',
        logic: 'O exercício libera endorfinas e BDNF, essenciais para a neuroplasticidade e regulação do cortisol no cérebro sob estresse.',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'action_02',
        category: 'action',
        title: 'A Armadura Externa',
        difficulty: 'Easy',
        duration: '15 min',
        science_fact: 'Vestir-se bem, fazer a barba e cuidar da aparência hoje.',
        logic: 'A imagem exterior disciplina a interior. Envia uma mensagem de controle e ordem ao cérebro, combatendo a letargia do luto.',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'action_03',
        category: 'action',
        title: 'Batismo de Gelo',
        difficulty: 'Hard',
        duration: '5 min',
        science_fact: 'Tomar um banho totalmente frio hoje.',
        logic: 'Baseado no desconforto voluntário estoico. Treina a mente para suportar choques e não ser escrava do conforto imediato.',
        image: 'https://images.unsplash.com/photo-1519750783826-e2420f4d687f?q=80&w=600&auto=format&fit=crop'
    },

    // CATEGORY 3: A Mente Estoica e TCC
    {
        id: 'stoic_01',
        category: 'stoic',
        title: 'O Diário da Realidade',
        difficulty: 'Medium',
        duration: '10 min',
        science_fact: 'Escrever 3 motivos concretos pelos quais o relacionamento não era ideal.',
        logic: 'Combate o "recall eufórico" (tendência de lembrar apenas o lado bom), forçando uma reavaliação negativa baseada em fatos.',
        image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'stoic_02',
        category: 'stoic',
        title: 'Arte da Resposta Tardia',
        difficulty: 'Medium',
        duration: '2h delay',
        science_fact: 'Se houver contato inevitável, espere 2 horas antes de responder.',
        logic: 'Não agir por impulso devolve o peso e o valor da sua própria presença e quebra a reatividade emocional.',
        image: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'stoic_03',
        category: 'stoic',
        title: 'Lista de Epicteto',
        difficulty: 'Hard',
        duration: '15 min',
        science_fact: 'Listar o que você não controla vs. o que você controla hoje.',
        logic: 'A Dicotomia do Controle é a base da paz estoica. Focar no que você controla economiza energia mental vital.',
        image: 'https://images.unsplash.com/photo-1505664159854-2326119c8152?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'stoic_04',
        category: 'stoic',
        title: 'Amor Fati: Aceitação Radical',
        difficulty: 'Hard',
        duration: '5 min',
        science_fact: 'Agradecer por uma lição aprendida através da dor atual.',
        logic: 'Transforma o obstáculo em ferramenta. A aceitação radical interrompe o ciclo de negação e sofrimento prolongado.',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop'
    },

    // CATEGORY 4: Autoexpansão e Reconstrução da Identidade
    {
        id: 'identity_01',
        category: 'identity',
        title: 'Ressuscitar um Laço',
        difficulty: 'Medium',
        duration: '10 min',
        science_fact: 'Reconectar-se com um amigo que se afastou durante o namoro.',
        logic: 'O apoio social é crucial para amortecer o isolamento. Reconstruir sua rede social é reconstruir sua rede de segurança.',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'identity_02',
        category: 'identity',
        title: '15 Minutos de Novidade',
        difficulty: 'Medium',
        duration: '15 min',
        science_fact: 'Estudar ou praticar algo totalmente novo (Xadrez, Idioma, etc).',
        logic: 'A competência gera confiança. Novos desafios forçam o cérebro a ocupar o espaço deixado pela relação com novos neurônios.',
        image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'identity_03',
        category: 'identity',
        title: 'Descartar as Relíquias',
        difficulty: 'Hard',
        duration: '20 min',
        science_fact: 'Guardar ou descartar presentes e objetos da ex.',
        logic: 'Limpar o ambiente visual de lembretes constantes é essencial para a libertação emocional e renovação do "self".',
        image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600&auto=format&fit=crop'
    }
];
