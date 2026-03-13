# TRPL.SPACE - Lab Rekayasa Perangkat Lunak

Website portfolio untuk menampilkan dan mengelola proyek-proyek, laboratorium, dan anggota tim dari Lab Rekayasa Perangkat Lunak dengan design neon cyber yang modern dan futuristik.

## Features

### 🏠 Landing Page
- 🎨 Design neon cyber dengan animasi dan efek listrik neon
- 📊 Dashboard statistik real-time
- 🔄 View switching (Grid/List view)
- 🔍 Filter by category, lab, status
- ⭐ Featured projects
- 📱 Fully responsive design

### 👥 Members Management
- 👨‍🏫 Profile dosen dengan foto efek neon
- 🧑‍🔬 Profile staf dan laboran
- 🎓 Education history & research interests
- 🔗 Academic profiles (Google Scholar, Scopus, SINTA, PDDikti, UGM)
- 🏢 Laboratory affiliations
- 💼 Functional & structural positions
- 📧 Contact information

### 🔬 Laboratory Pages
- 🏢 Lab profiles dengan anggota
- 👥 Team member preview
- 🔗 Lab affiliations untuk setiap anggota
- 📊 Lab statistics

### 💻 Project Management
- 📝 Full CRUD operations
- 👥 Multiple team members per project
- 🏷️ Categories & tags
- 🎨 Custom color schemes per project
- 📅 Timeline tracking
- 🔗 Subdomain links
- 🖼️ Thumbnail support

### 🔐 Admin Panel
- 🔒 Secure authentication with bcrypt
- ➕ Manage Projects, Labs, and Members
- 📈 Dashboard dengan statistik
- 🎯 User-friendly interface
- ✅ Form validation
- 🔔 Toast notifications
- 📸 Google Drive photo integration

## Tech Stack

### Backend
- **Framework**: [Fastify](https://www.fastify.io/) - Fast and low overhead web framework
- **Language**: TypeScript
- **ORM**: [Prisma](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM
- **Authentication**: bcryptjs for password hashing
- **Validation**: Zod schema validation

### Database
- **DBMS**: MySQL 8.0+
- **Schema Management**: Prisma Migrations

### Frontend
- **Languages**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Fonts**: 
  - Orbitron (Display/Headings)
  - Rajdhani (Body text)
- **Icons**: Unicode emoji & custom SVG
- **Image Hosting**: Google Drive integration

### Design System
- **Theme**: Neon Cyber / Cyberpunk
- **Color Palette**:
  - Primary: Neon Cyan (#00f0ff)
  - Secondary: Neon Pink (#ff006e)
  - Accent: Neon Purple (#a855f7)
  - Success: Neon Green (#00ff88)
- **Effects**: 
  - Glitch animations
  - Electric neon glow
  - Animated grid backgrounds
  - Smooth transitions & hover effects

### DevOps & Tools
- **Package Manager**: npm
- **Build Tool**: TypeScript Compiler (tsc)
- **Process Manager**: PM2 (production)
- **Version Control**: Git

## Setup

### 1. Install Dependencies

```bash
cd trpl.space
npm install
```

### 2. Setup Database

Edit file `.env` (copy dari `.env.example`):

```env
DATABASE_URL="mysql://username:password@localhost:3306/trpl_space"
PORT=3000
NODE_ENV=development
```

Sesuaikan dengan kredensial MySQL Hostinger Anda.

### 3. Generate Prisma Client & Run Migration

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## Build & Deploy

### 1. Build TypeScript

```bash
npm run build
```

### 2. Run Production

```bash
npm start
```

## Deployment ke Hostinger

### 1. Upload Files

Upload semua file ke hosting Hostinger Anda kecuali:
- `node_modules/` (akan di-install di server)
- `.env` (buat manual di server)

### 2. Install Dependencies di Server

Via SSH atau terminal Hostinger:

```bash
npm install --production
```

### 3. Setup Environment Variables

Buat file `.env` di server dengan kredensial MySQL dari Hostinger:

```env
DATABASE_URL="mysql://u123456_user:password@localhost:3306/u123456_trpl"
PORT=3000
NODE_ENV=production
```

### 4. Run Migration

```bash
npx prisma generate
npx prisma migrate deploy
```

### 5. Start Application

```bash
npm start
```

Atau gunakan PM2 untuk production:

```bash
npm install -g pm2
pm2 start dist/index.js --name "trpl-space"
pm2 save
pm2 startup
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login admin
- `POST /api/auth/change-password` - Change password

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Labs
- `GET /api/labs` - Get all labs
- `GET /api/labs/:id` - Get lab by ID
- `POST /api/labs` - Create new lab
- `PUT /api/labs/:id` - Update lab
- `DELETE /api/labs/:id` - Delete lab

### Members (Lecturers & Staff)
- `GET /api/lecturers` - Get all members
- `GET /api/lecturers/:id` - Get member by ID
- `GET /api/lecturers/short/:shortName` - Get member by short name
- `POST /api/lecturers` - Create new member
- `PUT /api/lecturers/:id` - Update member
- `DELETE /api/lecturers/:id` - Delete member

## Project Structure

```
trpl.space/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/           # API controllers
│   │   ├── projectController.ts
│   │   ├── labController.ts
│   │   ├── lecturerController.ts
│   │   └── authController.ts
│   ├── routes/                # API routes
│   │   ├── projectRoutes.ts
│   │   ├── labRoutes.ts
│   │   ├── lecturerRoutes.ts
│   │   └── authRoutes.ts
│   ├── services/              # Business logic
│   │   ├── prisma.ts
│   │   ├── projectService.ts
│   │   ├── labService.ts
│   │   ├── lecturerService.ts
│   │   └── authService.ts
│   └── index.ts               # Main server file
├── public/
│   ├── css/
│   │   ├── style.css          # Main styles
│   │   ├── detail.css         # Project detail styles
│   │   └── lecturer-detail.css # Member detail styles
│   ├── js/
│   │   ├── app.js             # Landing page
│   │   ├── detail.js          # Project detail
│   │   ├── lecturers.js       # Members page
│   │   ├── lecturer-detail.js # Member detail
│   │   └── labs.js            # Labs page
│   ├── admin/
│   │   ├── login.html         # Admin login
│   │   ├── index.html         # Projects management
│   │   ├── labs.html          # Labs management
│   │   ├── lecturers.html     # Members management
│   │   ├── admin.css          # Admin styles
│   │   └── *.js               # Admin scripts
│   ├── index.html             # Landing page
│   ├── project.html           # Project detail
│   ├── lecturer.html          # Member detail
│   ├── lecturers.html         # Members list
│   └── labs.html              # Labs list
├── change_password.js         # Password change utility
├── package.json
├── tsconfig.json
├── .env.example               # Environment template
└── README.md
```

## Usage

### 1. Access Landing Page

Buka `http://localhost:3000` atau `https://trpl.space`

### 2. Access Admin Panel

Buka `http://localhost:3000/admin` atau `https://trpl.space/admin`

**Default Admin Credentials:**
- Username: `admin`
- Password: `trpl2024`

⚠️ **IMPORTANT**: Segera ganti password default setelah login pertama!

### 3. Change Admin Password

Gunakan script untuk mengganti password:

```bash
node change_password.js admin newpassword123
```

### 4. Manage Projects

- Klik "Add Project" untuk menambah project baru
- Assign team members ke project
- Set custom colors untuk setiap project
- Upload thumbnail atau gunakan placeholder

### 5. Manage Members

- Klik "Add Member" untuk menambah dosen/staf
- Upload foto via Google Drive atau URL
- Tambahkan education history
- Link academic profiles (Scholar, Scopus, dll)
- Assign ke lab

### 6. Manage Labs

- Klik "Add Lab" untuk membuat lab baru
- Assign members ke lab

## Design Features

### Neon Cyber Theme

- **Colors**:
  - Neon Cyan: `#00f0ff`
  - Neon Pink: `#ff006e`
  - Neon Purple: `#a855f7`
  - Neon Green: `#00ff88`
  - Dark Background: `#0a0a0f`

- **Effects**:
  - Glitch animation
  - Glowing neon borders
  - Animated grid background
  - Smooth transitions
  - Hover effects

### Typography

- **Headings**: Orbitron (Futuristic)
- **Body**: Rajdhani (Clean & Modern)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Tips

### Projects
1. **Featured Projects**: Toggle featured untuk menampilkan project di bagian atas
2. **Status**: Gunakan "active" untuk project yang online, "maintenance" untuk dalam perbaikan
3. **Subdomain**: Pastikan subdomain unik untuk setiap project
4. **Thumbnail**: Gunakan URL image untuk tampilan lebih menarik
5. **Tags**: Pisahkan dengan koma untuk multiple tags
6. **Custom Colors**: Pilih warna yang sesuai dengan branding project

### Members (Lecturers & Staff)
1. **Photos**: Upload ke Google Drive dan set "Anyone with link can view"
2. **Short Name**: Gunakan 3-4 karakter unik (contoh: DRN, AKH, DSP)
3. **Functional Position**: 
   - Untuk dosen: Lektor, Lektor Kepala, Asisten Ahli, Guru Besar
   - Untuk staf: Laboran, Laboratory Staff, Technician, Staf Admin
4. **Education**: Tambahkan dari D3, S1, Profesi, S2, hingga S3
5. **Academic Links**: Tambahkan link Google Scholar, Scopus, SINTA untuk visibilitas

### Labs
1. Assign members yang relevan dengan bidang lab
2. Satu member bisa di-assign ke multiple labs

## Troubleshooting

### Database Connection Error

Pastikan:
- MySQL service berjalan
- Kredensial database benar di `.env`
- Database sudah dibuat
- User memiliki permission yang cukup

### Port Already in Use

Ganti port di `.env`:
```env
PORT=3001
```

### Prisma Migration Error

Reset database (WARNING: menghapus semua data):
```bash
npx prisma migrate reset
```

## License

MIT

## Author

Lab Rekayasa Perangkat Lunak

---

**Happy Coding!** 🚀
