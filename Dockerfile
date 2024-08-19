# Gunakan image Node.js resmi sebagai base image
FROM node:18

# Set working directory di dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Install dependensi aplikasi
RUN npm install

# Install Prisma CLI secara global
RUN npm install -g prisma

# Salin semua file aplikasi ke dalam container
COPY . .

# Expose port aplikasi
EXPOSE 3000

# Jalankan migrasi Prisma dan aplikasi
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
