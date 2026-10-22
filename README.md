# JAPM (Just Another Prompt Manager)

A comprehensive web application designed to streamline the process of prompt engineering, management, and utilization. JAPM serves as a centralized platform for creating, organizing, versioning, and deploying prompts effectively for interaction with various AI models.

## 🌟 Features

### Core Functionality
- **Project Management**: Create and manage projects to organize prompts
- **Prompt Management**: Create, view, update, and delete prompts within projects
- **Version Control**: Create and manage different versions of prompts with semantic versioning
- **Asset Management**: Define and manage reusable text pieces and variables
- **Translation Support**: Manage translations for prompts and assets in multiple languages
- **Prompt Wizard**: AI-assisted tool for creating structured prompts from natural language descriptions

### Advanced Features
- **AI Model Integration**: Configure and manage AI models for prompt generation
- **Marketplace**: Publish and share prompts (coming soon)
- **Collaboration**: Work within projects with multiple users
- **Responsive Design**: Works across all devices and screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js 24+ (see `.nvmrc`)
- npm or yarn
- A modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/japm.git
cd japm
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration.

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **API Client**: Axios with OpenAPI-generated client
- **UI Components**: Custom components with Heroicons

### Backend (API)
- RESTful API with OpenAPI specification
- JWT Authentication
- Prisma ORM for database operations

## 📚 Documentation

- [Product Requirements](docs/product_requirement_docs.md)
- [Technical Documentation](docs/technical.md)
- [Architecture Overview](docs/architecture.md)

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Generate API client
npm run generate:api
```

### Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # React components
│   ├── common/           # Shared components
│   ├── form/            # Form components
│   └── tables/          # Table components
├── services/             # API services
├── context/             # React context providers
└── utils/               # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All contributors who have helped shape this project
