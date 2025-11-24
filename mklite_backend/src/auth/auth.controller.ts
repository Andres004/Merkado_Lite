import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // Endpoint de Registro
    @Post('register')
    registerUser(@Body() userObject: RegisterAuthDto) {
        return this.authService.register(userObject);
    }

    // Endpoint de Login
    @Post('login') 
    loginUser(@Body() userObject: LoginAuthDto) {
        return this.authService.login(userObject);
    }

    // Endpoint Protegido (Prueba del Guardia)
    @UseGuards(AuthGuard('jwt')) 
    @Get('perfil')
    getProfile(@Request() req) {
        return {
            mensaje: '¡Si ves esto, tu token es válido!',
            usuario_detectado: req.user
        };
    }
}
