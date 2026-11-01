require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Opportunity = require('../models/Opportunity');
const connectDB = require('../config/db');

const users = [
  {
    name: 'Rahul Sharma', email: 'rahul@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 3,
    bio: 'Full-stack developer passionate about building products that matter. Looking for AI/ML teammates for hackathons.',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
    interests: ['Web Development', 'AI/ML', 'Hackathons', 'Startups'],
    clubs: ['Coding Club', 'Entrepreneurship Cell'],
    portfolioLinks: { github: 'https://github.com/rahul', linkedin: 'https://linkedin.com/in/rahul' },
    projects: [{ title: 'Campus Connect', description: 'College networking platform', techStack: ['React', 'Node.js', 'MongoDB'] }],
    achievements: ['Winner - Intra-College Hackathon 2024', 'Google DSC Lead'],
    lookingFor: 'AI/ML teammates for hackathons'
  },
  {
    name: 'Priya Verma', email: 'priya@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 3,
    bio: 'UI/UX designer who loves creating beautiful and accessible experiences. Figma expert.',
    skills: ['Figma', 'UI/UX Design', 'Adobe XD', 'React', 'JavaScript'],
    interests: ['UI/UX Design', 'Hackathons', 'Web Development', 'Open Source'],
    clubs: ['Design Club', 'Coding Club'],
    portfolioLinks: { github: 'https://github.com/priya' },
    projects: [{ title: 'Campus App Redesign', description: 'Redesigned the college mobile app UI', techStack: ['Figma', 'Adobe XD'] }],
    achievements: ['2nd Place - National Design Sprint'],
    lookingFor: 'Developers for product projects'
  },
  {
    name: 'Aman Gupta', email: 'aman@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 2,
    bio: 'Competitive programmer and algorithm enthusiast. Rating 1800+ on Codeforces.',
    skills: ['C++', 'Python', 'DSA', 'Competitive Programming', 'JavaScript'],
    interests: ['Competitive Programming', 'AI/ML', 'Open Source', 'Research'],
    clubs: ['ACM Chapter', 'Coding Club'],
    portfolioLinks: { github: 'https://github.com/aman' },
    projects: [{ title: 'Route Optimizer', description: 'Optimal delivery routes using graph algorithms', techStack: ['Python', 'C++'] }],
    achievements: ['ICPC Regionalist 2024', 'Codeforces Expert'],
    lookingFor: 'Research collaborators in algorithms'
  },
  {
    name: 'Neha Singh', email: 'neha@campus.edu', password: 'password123',
    branch: 'Information Technology', year: 4,
    bio: 'Senior ML engineer with experience in NLP and computer vision. Intern at Google.',
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn'],
    interests: ['AI/ML', 'Research', 'Hackathons', 'Open Source'],
    clubs: ['AI/ML Club', 'Research Cell'],
    portfolioLinks: { github: 'https://github.com/neha', linkedin: 'https://linkedin.com/in/neha' },
    projects: [
      { title: 'Sentiment Analyzer', description: 'NLP-based sentiment analysis tool', techStack: ['Python', 'TensorFlow'] },
      { title: 'Face Recognition System', description: 'Real-time face recognition', techStack: ['Python', 'OpenCV', 'Deep Learning'] }
    ],
    achievements: ['Google AI/ML Scholarship 2024', 'Published paper at NeurIPS Workshop'],
    lookingFor: 'Collaborators for NLP research'
  },
  {
    name: 'Vikas Mehta', email: 'vikas@campus.edu', password: 'password123',
    branch: 'Electronics & Communication', year: 3,
    bio: 'Embedded systems and IoT enthusiast. Building smart campus solutions.',
    skills: ['C++', 'Python', 'Networking', 'Linux', 'Cybersecurity'],
    interests: ['Cybersecurity', 'Robotics', 'Open Source', 'Competitive Programming'],
    clubs: ['Robotics Club', 'Cybersecurity Club'],
    portfolioLinks: { github: 'https://github.com/vikas' },
    projects: [{ title: 'Smart Attendance System', description: 'IoT-based attendance using RFID', techStack: ['C++', 'Python', 'Arduino'] }],
    achievements: ['1st Place - Robotics Competition 2024'],
    lookingFor: 'IoT and robotics collaborators'
  },
  {
    name: 'Anjali Patel', email: 'anjali@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 2,
    bio: 'Frontend developer and aspiring full-stack dev. Love building user-centric products.',
    skills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'Figma'],
    interests: ['Web Development', 'UI/UX Design', 'Hackathons', 'Startups'],
    clubs: ['Coding Club', 'Entrepreneurship Cell'],
    portfolioLinks: { github: 'https://github.com/anjali' },
    projects: [{ title: 'StudyBuddy', description: 'Collaborative study platform for students', techStack: ['React', 'JavaScript', 'Firebase'] }],
    achievements: ['Top 10 - HackWithInfy 2024'],
    lookingFor: 'Backend developers for side projects'
  },
  {
    name: 'Rohan Kumar', email: 'rohan@campus.edu', password: 'password123',
    branch: 'Information Technology', year: 3,
    bio: 'Backend developer specializing in scalable systems and cloud architecture.',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
    interests: ['Cloud Computing', 'Web Development', 'Open Source', 'Startups'],
    clubs: ['Cloud Computing Club', 'Coding Club'],
    portfolioLinks: { github: 'https://github.com/rohan', linkedin: 'https://linkedin.com/in/rohan' },
    projects: [{ title: 'Microservices Platform', description: 'Distributed microservices with Docker', techStack: ['Node.js', 'Docker', 'Kubernetes'] }],
    achievements: ['AWS Certified Developer', 'Finalist - Smart India Hackathon'],
    lookingFor: 'Frontend developers for startup ideas'
  },
  {
    name: 'Sneha Joshi', email: 'sneha@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 1,
    bio: 'First year student eager to learn web development and join hackathon teams.',
    skills: ['JavaScript', 'HTML', 'CSS', 'Python'],
    interests: ['Web Development', 'AI/ML', 'Hackathons'],
    clubs: ['Coding Club'],
    portfolioLinks: { github: 'https://github.com/sneha' },
    projects: [],
    achievements: ['State-level Coding Olympiad Silver Medal'],
    lookingFor: 'Mentors and hackathon teams'
  },
  {
    name: 'Arjun Nair', email: 'arjun@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 4,
    bio: 'Senior developer with internship at Microsoft. Expert in system design.',
    skills: ['Java', 'System Design', 'DSA', 'Spring Boot', 'SQL'],
    interests: ['Research', 'Open Source', 'Startups', 'Hackathons'],
    clubs: ['ACM Chapter', 'Entrepreneurship Cell'],
    portfolioLinks: { github: 'https://github.com/arjun', linkedin: 'https://linkedin.com/in/arjun' },
    projects: [{ title: 'Distributed Cache', description: 'Redis-like distributed cache', techStack: ['Java', 'Networking', 'System Design'] }],
    achievements: ['Microsoft Intern 2024', 'GATE Qualified'],
    lookingFor: 'Juniors to mentor in DSA and system design'
  },
  {
    name: 'Meera Reddy', email: 'meera@campus.edu', password: 'password123',
    branch: 'Information Technology', year: 2,
    bio: 'Data science enthusiast who loves visualization and storytelling with data.',
    skills: ['Python', 'Data Analysis', 'Power BI', 'Tableau', 'Machine Learning', 'SQL'],
    interests: ['AI/ML', 'Research', 'Web Development', 'Open Source'],
    clubs: ['Data Science Club', 'AI/ML Club'],
    portfolioLinks: { github: 'https://github.com/meera' },
    projects: [{ title: 'COVID Data Dashboard', description: 'Interactive COVID-19 data visualization', techStack: ['Python', 'Tableau'] }],
    achievements: ['Kaggle Expert', 'Data Science Bootcamp Certificate'],
    lookingFor: 'Teammates for data science competitions'
  },
  {
    name: 'Karan Jain', email: 'karan@campus.edu', password: 'password123',
    branch: 'Electronics & Communication', year: 3,
    bio: 'Mobile app developer specializing in React Native and Flutter.',
    skills: ['React Native', 'Flutter', 'JavaScript', 'Dart', 'Firebase'],
    interests: ['App Development', 'UI/UX Design', 'Startups', 'Hackathons'],
    clubs: ['App Development Club', 'Entrepreneurship Cell'],
    portfolioLinks: { github: 'https://github.com/karan' },
    projects: [{ title: 'Campus Food App', description: 'Mobile app for campus canteen ordering', techStack: ['React Native', 'Firebase'] }],
    achievements: ['Published app with 1000+ downloads'],
    lookingFor: 'Backend developers for mobile app projects'
  },
  {
    name: 'Divya Sharma', email: 'divya@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 4,
    bio: 'Cybersecurity researcher and CTF player. Passionate about ethical hacking.',
    skills: ['Cybersecurity', 'Python', 'Linux', 'Networking', 'C++'],
    interests: ['Cybersecurity', 'Research', 'Open Source', 'Competitive Programming'],
    clubs: ['Cybersecurity Club', 'ACM Chapter'],
    portfolioLinks: { github: 'https://github.com/divya' },
    projects: [{ title: 'VulnScanner', description: 'Automated vulnerability scanner', techStack: ['Python', 'Networking'] }],
    achievements: ['CTFtime Top 100', 'Bugcrowd Hall of Fame'],
    lookingFor: 'CTF teammates and security researchers'
  },
  {
    name: 'Siddharth Roy', email: 'siddharth@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 2,
    bio: 'Game developer and graphics programmer. Building indie games using Unity.',
    skills: ['C#', 'Unity', 'C++', 'JavaScript', 'Python'],
    interests: ['Gaming', 'Web Development', 'Open Source', 'Competitive Programming'],
    clubs: ['Game Dev Club', 'Coding Club'],
    portfolioLinks: { github: 'https://github.com/siddharth' },
    projects: [{ title: 'Campus Quest', description: 'Campus-themed mobile game', techStack: ['Unity', 'C#'] }],
    achievements: ['Global Game Jam 2024 Participant'],
    lookingFor: 'Game designers and artists'
  },
  {
    name: 'Pooja Agarwal', email: 'pooja@campus.edu', password: 'password123',
    branch: 'Information Technology', year: 3,
    bio: 'Blockchain developer exploring DeFi and Web3 applications.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Solidity'],
    interests: ['Blockchain', 'Startups', 'Web Development', 'Research'],
    clubs: ['Blockchain Club', 'Entrepreneurship Cell'],
    portfolioLinks: { github: 'https://github.com/pooja', linkedin: 'https://linkedin.com/in/pooja' },
    projects: [{ title: 'DeFi Lending Protocol', description: 'Decentralized lending platform', techStack: ['Solidity', 'React', 'Hardhat'] }],
    achievements: ['ETHIndia 2024 Finalist', 'Polkadot Hackathon Winner'],
    lookingFor: 'Smart contract developers and Web3 enthusiasts'
  },
  {
    name: 'Suresh Pillai', email: 'suresh@campus.edu', password: 'password123',
    branch: 'Mechanical', year: 3,
    bio: 'Mechanical engineer with passion for robotics and automation.',
    skills: ['Python', 'C++', 'Linux', 'MATLAB'],
    interests: ['Robotics', 'AI/ML', 'Open Source', 'Research'],
    clubs: ['Robotics Club', 'AI/ML Club'],
    portfolioLinks: { github: 'https://github.com/suresh' },
    projects: [{ title: 'Autonomous Bot', description: 'Self-navigating robot for warehouse', techStack: ['Python', 'ROS', 'C++'] }],
    achievements: ['Robocon 2024 Participant', 'Best Robotics Project Award'],
    lookingFor: 'Software developers for robotics projects'
  },
  {
    name: 'Tanvi Shah', email: 'tanvi@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 1,
    bio: 'First year CS student interested in full-stack development and hackathons.',
    skills: ['JavaScript', 'Python', 'HTML', 'CSS', 'React'],
    interests: ['Web Development', 'Hackathons', 'AI/ML', 'Open Source'],
    clubs: ['Coding Club'],
    portfolioLinks: { github: 'https://github.com/tanvi' },
    projects: [],
    achievements: ['School Valedictorian', 'JEE Advanced AIR 5000'],
    lookingFor: 'Hackathon teams and project collaborators'
  },
  {
    name: 'Ravi Teja', email: 'ravi@campus.edu', password: 'password123',
    branch: 'Electrical', year: 4,
    bio: 'Signal processing and embedded systems expert. Working on EV technology.',
    skills: ['Python', 'MATLAB', 'C', 'Networking', 'Data Analysis'],
    interests: ['Research', 'Robotics', 'AI/ML', 'Open Source'],
    clubs: ['IEEE Chapter', 'Robotics Club'],
    portfolioLinks: { github: 'https://github.com/ravi', linkedin: 'https://linkedin.com/in/ravi' },
    projects: [{ title: 'EV Battery Management', description: 'Smart BMS for electric vehicles', techStack: ['Python', 'MATLAB', 'C'] }],
    achievements: ['IEEE Best Paper Award', 'DRDO Intern 2024'],
    lookingFor: 'CS collaborators for signal processing projects'
  },
  {
    name: 'Ishaan Chopra', email: 'ishaan@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 3,
    bio: 'DevOps engineer and open source contributor. Maintaining 3 OSS projects.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Python', 'Linux', 'CI/CD'],
    interests: ['Cloud Computing', 'Open Source', 'Startups', 'Web Development'],
    clubs: ['Cloud Computing Club', 'Open Source Club'],
    portfolioLinks: { github: 'https://github.com/ishaan', linkedin: 'https://linkedin.com/in/ishaan' },
    projects: [{ title: 'K8s Monitoring Tool', description: 'Kubernetes cluster monitoring dashboard', techStack: ['Docker', 'Kubernetes', 'Prometheus'] }],
    achievements: ['GCP Certified Professional', 'Contributed to Kubernetes core'],
    lookingFor: 'Backend developers for cloud projects'
  },
  {
    name: 'Ananya Bhatt', email: 'ananya@campus.edu', password: 'password123',
    branch: 'Information Technology', year: 2,
    bio: 'Content creator and community builder in tech. Runs a 5k-subscriber YouTube channel.',
    skills: ['JavaScript', 'React', 'Python', 'Figma'],
    interests: ['Web Development', 'UI/UX Design', 'Open Source', 'Startups'],
    clubs: ['Media Club', 'Coding Club'],
    portfolioLinks: { github: 'https://github.com/ananya' },
    projects: [{ title: 'DevTalks', description: 'Tech podcast and YouTube channel', techStack: ['React', 'JavaScript'] }],
    achievements: ['5000 YouTube Subscribers', 'TEDx Speaker'],
    lookingFor: 'Technical collaborators for EdTech startup'
  },
  {
    name: 'Akash Tiwari', email: 'akash@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 4,
    bio: 'Research intern at IIT working on graph neural networks and social network analysis.',
    skills: ['Python', 'Machine Learning', 'PyTorch', 'Research', 'DSA'],
    interests: ['AI/ML', 'Research', 'Competitive Programming', 'Open Source'],
    clubs: ['Research Cell', 'AI/ML Club', 'ACM Chapter'],
    portfolioLinks: { github: 'https://github.com/akash', linkedin: 'https://linkedin.com/in/akash' },
    projects: [
      { title: 'GNN for Social Networks', description: 'Graph neural network for friend recommendation', techStack: ['Python', 'PyTorch'] },
      { title: 'Knowledge Graph Builder', description: 'Automated knowledge graph from text', techStack: ['Python', 'NLP'] }
    ],
    achievements: ['IIT Research Intern 2024', 'Best Paper - College Symposium 2024'],
    lookingFor: 'Research collaborators in ML and graph algorithms'
  },
  {
    name: 'Kavya Menon', email: 'kavya@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 2,
    bio: 'App developer focusing on accessibility and inclusive design.',
    skills: ['Flutter', 'Dart', 'React Native', 'Figma', 'UI/UX Design', 'Firebase'],
    interests: ['App Development', 'UI/UX Design', 'Open Source', 'Hackathons'],
    clubs: ['App Development Club', 'Design Club'],
    portfolioLinks: { github: 'https://github.com/kavya' },
    projects: [{ title: 'AccessiLearn', description: 'Accessible learning app for differently-abled students', techStack: ['Flutter', 'Firebase', 'Dart'] }],
    achievements: ['1st Place - Accessibility Hackathon', 'Google Flutter Festival Award'],
    lookingFor: 'Backend developers for mobile apps'
  },
  {
    name: 'Mohit Saxena', email: 'mohit@campus.edu', password: 'password123',
    branch: 'Information Technology', year: 3,
    bio: 'Backend developer and database optimization expert.',
    skills: ['Node.js', 'PostgreSQL', 'MongoDB', 'Redis', 'System Design', 'JavaScript'],
    interests: ['Web Development', 'Cloud Computing', 'Open Source', 'Research'],
    clubs: ['Coding Club', 'Cloud Computing Club'],
    portfolioLinks: { github: 'https://github.com/mohit', linkedin: 'https://linkedin.com/in/mohit' },
    projects: [{ title: 'Query Optimizer', description: 'ML-based SQL query optimizer', techStack: ['Node.js', 'PostgreSQL', 'Python'] }],
    achievements: ['Open Source Contributor of the Month', 'AWS Hackathon Finalist'],
    lookingFor: 'Frontend developers for SaaS product'
  },
  {
    name: 'Shreya Kapoor', email: 'shreya@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 1,
    bio: 'Passionate about competitive programming and mathematics.',
    skills: ['C++', 'Python', 'DSA', 'Mathematics'],
    interests: ['Competitive Programming', 'Research', 'AI/ML', 'Open Source'],
    clubs: ['ACM Chapter', 'Math Club'],
    portfolioLinks: { github: 'https://github.com/shreya' },
    projects: [],
    achievements: ['National Math Olympiad Bronze', 'Codeforces Pupil'],
    lookingFor: 'Competitive programming practice partners'
  },
  {
    name: 'Dhruv Malhotra', email: 'dhruv@campus.edu', password: 'password123',
    branch: 'Electronics & Communication', year: 4,
    bio: 'VLSI engineer interested in chip design and hardware-software co-design.',
    skills: ['Python', 'C', 'MATLAB', 'Linux'],
    interests: ['Research', 'Robotics', 'AI/ML', 'Open Source'],
    clubs: ['IEEE Chapter', 'Research Cell'],
    portfolioLinks: { github: 'https://github.com/dhruv' },
    projects: [{ title: 'RISC-V Processor', description: 'Custom RISC-V processor implementation', techStack: ['C', 'Linux'] }],
    achievements: ['VLSI Design Contest Winner', 'Qualcomm Innovation Award'],
    lookingFor: 'Software developers for hardware-software projects'
  },
  {
    name: 'Ritika Bose', email: 'ritika@campus.edu', password: 'password123',
    branch: 'Computer Science', year: 3,
    bio: 'Full-stack developer and startup enthusiast. Building an EdTech startup.',
    skills: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'Machine Learning'],
    interests: ['Startups', 'Web Development', 'AI/ML', 'Hackathons'],
    clubs: ['Entrepreneurship Cell', 'AI/ML Club', 'Coding Club'],
    portfolioLinks: { github: 'https://github.com/ritika', linkedin: 'https://linkedin.com/in/ritika' },
    projects: [{ title: 'EduPlatform', description: 'Personalized learning platform with ML recommendations', techStack: ['React', 'Node.js', 'Python', 'MongoDB'] }],
    achievements: ['Forbes 30 Under 30 Nominee', 'Y Combinator Shortlisted'],
    lookingFor: 'Co-founders and developers for EdTech startup'
  }
];

// Connection pairs (by index in users array)
// Designed to create a large connected main component and a small isolated component
// Main component: users 0–22, 24
// Small component: users 14, 16, 23 (Suresh, Ravi, Shreya — form their own group)
// User 24 (Dhruv) is isolated initially
const connectionPairs = [
  // Main cluster — Rahul's circle
  [0, 1], [0, 2], [0, 5], [0, 6],
  // Priya's connections
  [1, 2], [1, 5], [1, 10],
  // Aman's connections (goes deep into graph)
  [2, 3], [2, 8],
  // Neha's connections
  [3, 9], [3, 19],
  // Vikas's connections (links to Divya and Suresh)
  [4, 11],
  // Anjali's connections
  [5, 6], [5, 18],
  // Rohan's connections
  [6, 17], [6, 22],
  // Sneha connects via Anjali and Tanvi
  [7, 5], [7, 15],
  // Arjun connects to Akash and Divya
  [8, 19], [8, 11],
  // Meera connects to Akash and Kavya
  [9, 19], [9, 21],
  // Karan connects to Kavya
  [10, 21],
  // Siddharth connects back to Aman
  [12, 2],
  // Pooja connects to Rohan and Mohit
  [13, 6], [13, 22],
  // Tanvi connects to Kavya
  [15, 21],
  // Ishaan connects to Ananya
  [17, 18],
  // Akash connects to Ritika
  [19, 24],
  // Kavya connects to Mohit
  [21, 22],
  // Mohit connects to Ritika
  [22, 24],
  // Ritika connects to Priya (closing some triangles for rich recommendations)
  [24, 1],
  // Small isolated cluster: Suresh, Ravi, Shreya
  [14, 16], [14, 23], [16, 23]
];

const opportunities = [
  {
    title: 'Need UI/UX Designer for AI Hackathon',
    description: 'We are a team of 2 backend developers building an AI-powered resume analyzer for a national hackathon. We need a skilled UI/UX designer who can create beautiful, user-friendly interfaces. The hackathon is next month.',
    type: 'hackathon',
    requiredSkills: ['Figma', 'UI/UX Design', 'React'],
    requiredInterests: ['Hackathons', 'AI/ML', 'UI/UX Design'],
    teamSize: 4,
    status: 'open',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'ML Engineer Needed for Research Project',
    description: 'Working on a computer vision project to detect plant diseases using deep learning. Looking for an ML engineer with TensorFlow or PyTorch experience. Great for research paper publication.',
    type: 'research',
    requiredSkills: ['Machine Learning', 'Python', 'TensorFlow', 'Deep Learning'],
    requiredInterests: ['AI/ML', 'Research'],
    teamSize: 3,
    status: 'open',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Full-Stack Developer for EdTech Startup',
    description: 'Building a personalized learning platform that uses AI to adapt content to each student. Looking for a passionate full-stack developer to join as a co-founder. Equity-based opportunity with real impact.',
    type: 'project',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS'],
    requiredInterests: ['Startups', 'Web Development', 'AI/ML'],
    teamSize: 3,
    status: 'open'
  },
  {
    title: 'Cybersecurity Expert for CTF Team',
    description: 'Forming a competitive CTF (Capture the Flag) team for inter-college and national competitions. Looking for students with experience in web exploitation, reverse engineering, binary exploitation, or cryptography.',
    type: 'other',
    requiredSkills: ['Cybersecurity', 'Python', 'Linux', 'Networking'],
    requiredInterests: ['Cybersecurity', 'Competitive Programming'],
    teamSize: 5,
    status: 'open',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Backend Developer for Campus App v2',
    description: 'Revamping the official college campus app. Currently serves 5000+ students. Need a backend developer with Node.js and PostgreSQL experience. This will be a great portfolio project.',
    type: 'project',
    requiredSkills: ['Node.js', 'PostgreSQL', 'REST APIs', 'Docker'],
    requiredInterests: ['Web Development', 'Open Source'],
    teamSize: 4,
    status: 'open',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log('\n🌱 Connected to database. Starting seed...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Connection.deleteMany({}),
      Opportunity.deleteMany({})
    ]);
    console.log('✓ Cleared existing data');

    // Create users (hash passwords manually since seed bypasses pre-save hook for batch ops)
const createdUsers = [];

for (const userData of users) {
    const { password, ...rest } = userData;

    const user = await User.create({
        ...rest,
        passwordHash: password
    });

    createdUsers.push(user);
}
    console.log(`✓ Created ${createdUsers.length} users`);

    // Create connections
    const connectionDocs = connectionPairs.map(([i, j]) => ({
      sender: createdUsers[i]._id,
      receiver: createdUsers[j]._id,
      status: 'accepted'
    }));
    await Connection.insertMany(connectionDocs);
    console.log(`✓ Created ${connectionDocs.length} connections`);

    // Create opportunities (different creators)
    const creatorIndices = [0, 3, 24, 11, 6];
    for (let i = 0; i < opportunities.length; i++) {
      await Opportunity.create({
        ...opportunities[i],
        creator: createdUsers[creatorIndices[i]]._id,
        currentMembers: [createdUsers[creatorIndices[i]]._id]
      });
    }
    console.log(`✓ Created ${opportunities.length} opportunities`);

    console.log('\n════════════════════════════════════════');
    console.log('  SEED COMPLETE — Campus Connect');
    console.log('════════════════════════════════════════');
    console.log('\n📧 Test accounts (all use: password123):');
    console.log('   rahul@campus.edu  (Rahul Sharma, CS Year 3)');
    console.log('   priya@campus.edu  (Priya Verma, CS Year 3)');
    console.log('   neha@campus.edu   (Neha Singh, IT Year 4)');
    console.log('\n📊 Graph structure:');
    console.log(`   ${createdUsers.length} students (vertices)`);
    console.log(`   ${connectionDocs.length} connections (edges)`);
    console.log('   2 connected components (main + small cluster)');
    console.log('\n🔍 Try BFS from rahul → neha or rahul → meera (3+ hops)\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seedDatabase();
