// All biographical claims and metrics below come from references/resume.pdf.
export const profile = {
  name: 'Alam Zia', location: 'Bengaluru, India', email: 'alamziya.fzd@gmail.com',
  linkedin: 'https://linkedin.com/in/alamzia23', github: 'https://github.com/alamzia23',
  resume: '/Alam-Zia-Resume.pdf',
};
export const chapters = ['Home', 'Work', 'Process', 'About', 'Contact'] as const;
export const projects = [
  { title: 'webMethods MFT', category: '01 / PRODUCTION INFRASTRUCTURE', short: 'The systems behind the transfer.',
    description: 'Production Kubernetes and OpenShift for a multi-tenant file-transfer product, across AWS EKS and Azure. From Helm and GitOps to networking, TLS, image rollouts and release troubleshooting.',
    tags: ['AWS EKS', 'OpenShift', 'Helm', 'Argo CD'], metric: '150+', metricLabel: 'secrets migrated through automation',
    detail: 'Automated a regional migration of 150+ secrets, replacing approximately 1.5–2 days of manual work with a pipeline. Implemented custom-metric HPA, reducing infrastructure cost by approximately 25%.',
    context: 'IBM ISL · webMethods Managed File Transfer' },
  { title: 'Delivery, engineered.', category: '02 / CI/CD & AUTOMATION', short: 'From a commit to a reliable release.',
    description: 'GitHub Actions and Tekton workflows for CI, tenant operations, validation, security scanning and deployment. Repeatable delivery designed around the needs of the engineering team.',
    tags: ['GitHub Actions', 'Tekton', 'Terraform', 'Security'], metric: '15+', metricLabel: 'pipelines used by 30+ engineers',
    detail: 'Built tenant provision and suspend workflows for APICP, APIGW and DPO, reducing cloud cost by approximately 30% between peak and idle. Automated Jira creation for critical vulnerabilities.',
    context: 'IBM ISL · Platform delivery workflows' },
  { title: 'Sovereign GitOps', category: '03 / OPENSHIFT CATALOG SERVICES', short: 'A delivery path you can own.',
    description: 'A Gitea, Tekton and Argo CD delivery pipeline on OpenShift, built for the IBM Sovereign Core Catalogathon. Source, build and deployment connected through GitOps.',
    tags: ['Gitea', 'Tekton', 'Argo CD', 'OpenShift'], metric: '02', metricLabel: 'catalog services merged upstream',
    detail: 'Shipped the GitOps delivery pipeline and a RabbitMQ health agent as two OpenShift catalog services. Both were merged upstream.',
    context: 'IBM Sovereign Core Catalogathon' },
  { title: 'Memory for machines.', category: '04 / AI AGENTS & INTELLIGENT AUTOMATION', short: 'Context that stays with the system.',
    description: 'Smriti brings knowledge-graph recall to on-call work, retrieving prior root causes with Cognee Cloud and signed webhooks. Earlier Watsonx and Watson Discovery work supported internal product Q&A.',
    tags: ['Smriti', 'Cognee Cloud', 'Watsonx', 'AI agents'], metric: 'Top 50', metricLabel: 'of 3,000+ · OSS First Mate',
    detail: 'OSS First Mate combines stale-PR detection and duplicate-issue clustering across Claude, GitHub, Slack and Notion. MeritLens explores a multi-agent performance-review pipeline for the OpenAI × Outskill hackathon.',
    context: 'Smriti · OSS First Mate · MeritLens' },
];
// Editorial process statements, grounded in the types of work documented in the resume.
export const processSteps = [
  ['Understand the system.', 'Start with the paths that matter: how data moves, where trust changes, and what a failure interrupts. Make dependencies visible before changing infrastructure.'],
  ['Make delivery repeatable.', 'Put configuration and delivery into version control. Build clear validation gates, small release steps and a deployment path the team can follow.'],
  ['Secure the foundations.', 'Treat identity, secrets, TLS and vulnerability checks as part of the system. Automate the controls that need to survive every release.'],
  ['Observe. Then improve.', 'Use metrics, logs and health checks to understand production. Connect operational evidence to capacity decisions and incident response.'],
  ['Build for the next shift.', 'Make recovery and prior context available to the next engineer. Reliable systems need understandable workflows as much as they need automation.'],
];
export const experience = [
  ['Jul 2024 — Present', 'IBM ISL', 'DevOps Engineer · webMethods MFT'],
  ['Jun — Jul 2024', 'Software AG', 'DevOps Engineer I · webMethods'],
  ['Dec 2023 — May 2024', 'Software AG', 'DevOps Intern'],
];
