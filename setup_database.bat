@echo off
echo ========================================
echo FYNEST Database Setup
echo ========================================
echo.
echo Mencoba setup database...
echo.

REM Cari MySQL di XAMPP
set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe

if not exist "%MYSQL_PATH%" (
    echo ERROR: MySQL tidak ditemukan di C:\xampp\mysql\bin\
    echo Pastikan XAMPP sudah terinstall dengan benar.
    pause
    exit /b 1
)

echo MySQL ditemukan!
echo Menjalankan setup database...
echo.

REM Jalankan SQL script
"%MYSQL_PATH%" -u root < setup_database.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo DATABASE BERHASIL DIBUAT!
    echo ========================================
    echo.
    echo Database: fynest_db
    echo Tabel: products
    echo Sample Data: 3 produk
    echo.
    echo Silakan refresh halaman Admin Anda!
    echo.
) else (
    echo.
    echo ========================================
    echo GAGAL SETUP DATABASE
    echo ========================================
    echo.
    echo Kemungkinan penyebab:
    echo 1. MySQL di XAMPP belum running
    echo 2. Ada error di script SQL
    echo.
    echo Coba buka XAMPP Control Panel dan
    echo pastikan MySQL berwarna HIJAU.
    echo.
)

pause
