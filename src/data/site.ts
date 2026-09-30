export const site = {
  name: 'Mohamed Musthakeem M',
  displayName: 'Mohamed Musthakeem',
  role: 'AI/ML Engineer',
  positioning: 'AI/ML Engineer • Data Science • Generative AI • Python',
  email: 'musthakeemmohamed44@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mohamedmusthakeem',
  github: 'https://github.com/Mohamedmusthakeem',
  intro: 'Building intelligent, data-driven applications with Machine Learning, Generative AI and Python.',
};

export const skills = {
  'Programming & Web': ['Python','SQL','JavaScript','HTML5','CSS3','Bootstrap','PHP'],
  'Machine Learning': ['Scikit-learn','Supervised Learning','Unsupervised Learning','Reinforcement Learning','Feature Engineering','Model Evaluation'],
  'Deep Learning & AI': ['TensorFlow','Neural Network Fundamentals','Generative AI','Prompt Engineering'],
  'Data Science': ['NumPy','Pandas','Matplotlib','Seaborn','EDA','Data Preprocessing','Visualization'],
  'Data & BI': ['Power BI','Tableau','Excel','Kaggle','MySQL'],
  'Development Tools': ['Git','GitHub','VS Code','Chrome DevTools','Figma','Canva'],
  'Methodologies': ['Agile/Scrum','Technical Documentation','Debugging','Testing','Iterative Development'],
};

export const experiences = [
  {
    role: 'Python, Machine Learning, AI & Data Science Intern',
    company: 'CodeBind Technologies, Tiruchirappalli',
    dates: 'Jun 2026 – Jul 2026',
    points: ['Supervised, unsupervised and reinforcement learning','Python and Scikit-learn','Linear Regression, SVM, Decision Trees, KNN, K-Means and PCA','Kaggle datasets, EDA, preprocessing and feature engineering','Model training, hyperparameter tuning and model evaluation','Accuracy, F1-score and RMSE evaluation','Pandas, NumPy, Matplotlib and Seaborn','Agile-style reviews and technical documentation'],
  },
  {
    role: 'Website Design & Development Intern',
    company: 'MAAC Technologies, Tiruchirappalli',
    dates: 'Jun 2025 – Jul 2025',
    points: ['Responsive web development','HTML5, CSS3, JavaScript, Bootstrap and PHP','Contact forms and validation','Semantic HTML and SEO practices','Git/GitHub and Chrome DevTools','Figma and Canva'],
  },
];

export const projects = [
  {
    id: 'answeriq', title: 'AI Answer Evaluator', category: 'AI / NLP / LLM', featured: true,
    stack: ['Python','LLM','NLP','Machine Learning'],
    description: 'AI-assisted answer evaluation workflow designed to compare student responses with reference answers and support structured rubric-based evaluation.',
    github: 'https://github.com/Mohamedmusthakeem/AI-Answer-Evaluator/tree/main',
    demo: 'https://ai-answer-evaluator.onrender.com/', visual: 'evaluation',
    details: ['Student responses can be evaluated against reference answers using a structured rubric workflow.','The project focuses on AI-assisted evaluation rather than unsupported performance claims.'],
  },
  {
    id: 'phantomnet', title: 'PhantomNet — Generative Cyber-Deception LLM Honeypots', category: 'Generative AI / Cybersecurity', featured: true,
    stack: ['Python','LLM','Cybersecurity','AI'],
    description: 'Generative AI cybersecurity concept around LLM-powered cyber-deception and honeypot workflows in controlled environments.',
    github: 'https://github.com/Mohamedmusthakeem/-PhantomNet-Generative-Cyber-Deception-LLM-Honeypots-/tree/main',
    demo: 'https://phantomnet-generative-cyber-deception-ct14.onrender.com/', visual: 'network',
    details: ['Explores LLM-powered interaction concepts for controlled cyber-deception environments.','Presented as a defensive research and demonstration project, not as malicious tooling.'],
  },
  {
    id: 'ml-suite', title: 'ML Model Comparison Suite', category: 'Machine Learning', featured: false,
    stack: ['Python','Scikit-learn','Pandas','Kaggle'],
    description: 'Comparative machine learning pipeline to train and evaluate multiple algorithms across Kaggle datasets and document trade-offs using Accuracy, F1-score and RMSE.',
    visual: 'chart', details: ['Compares model approaches using standard evaluation measures.','Exact performance values are intentionally omitted where verified project data is unavailable.'],
  },
  {
    id: 'vk-plate-decors', title: 'VK Plate Decors — Business Website', category: 'Web Development', featured: false,
    stack: ['HTML5','CSS3','JavaScript','Bootstrap','PHP','SEO'],
    description: 'Responsive business website with PHP contact form, semantic HTML and SEO practices.',
    visual: 'browser', details: ['Focuses on responsive presentation, contact form handling, semantic structure and SEO-oriented implementation.'],
  },
];

export const education = [
  { degree: 'B.Tech – Artificial Intelligence & Data Science', school: 'CARE College of Engineering, Trichy', value: '2023 – 2027' },
  { degree: 'HSC', school: 'kAP Higher Secondary School, Trichy', value: '77.5%' },
  { degree: 'SSLC', school: 'kAP Higher Secondary School, Trichy', value: '80%' },
];

export const certifications = [
  ['AWS Academy Graduate – Generative AI Foundations','Amazon Web Services','2025'],
  ['Inplant Training Certificate – Python, ML & AI','CodeBind Technologies','Jul 2026'],
  ['AWS Academy Graduate – Machine Learning For NLP','Amazon Web Services','2026'],
  ['Website Design & Development Internship Certificate','MAAC Technologies','Jul 2025'],
] as const;

export const achievements = [
  'Participation in state-level hackathons and technical competitions',
  'Practical machine learning, Generative AI, web development and data science projects',
  'Kaggle-based machine learning experimentation',
  'Technical project documentation',
];
