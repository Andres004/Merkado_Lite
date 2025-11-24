import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

// LA PALABRA "export" ES OBLIGATORIA
export class RegisterAuthDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    nombre: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    apellido: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    ci: string;

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(150)
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    telefono: string;

    @IsNotEmpty()
    @IsString()
    direccion: string;
}