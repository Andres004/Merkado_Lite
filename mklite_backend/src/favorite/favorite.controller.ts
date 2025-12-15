import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('favorite')
@UseGuards(AuthGuard('jwt'))
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get('me')
  async getMyFavorites(@Req() req: Request & { user?: any }) {
    const userId = req.user?.id_usuario;

    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.favoriteService.getFavoritesByUser(userId);
  }

  @Post()
  async addFavorite(
    @Req() req: Request & { user?: any },
    @Body('id_producto', ParseIntPipe) id_producto: number,
  ) {
    const userId = req.user?.id_usuario;

    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.favoriteService.addFavorite(userId, id_producto);
  }

  @Delete('/:id_producto')
  async removeFavorite(
    @Req() req: Request & { user?: any },
    @Param('id_producto', ParseIntPipe) id_producto: number,
  ) {
    const userId = req.user?.id_usuario;

    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.favoriteService.removeFavorite(userId, id_producto);
  }
}