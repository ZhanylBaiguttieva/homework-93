import { Body, Controller, Delete, Post, Req, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../schemas/user.schema";
import { RegisterUserDto } from "./register-user.dto";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { TokenAuthGuard } from "../auth/token-auth.guard";


@Controller('users')
export class UsersController {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}
  @Post()
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    try {
      const user = new this.userModel({
        email: registerUserDto.email,
        password: registerUserDto.password,
        displayName: registerUserDto.displayName,
        role: registerUserDto.role,
      });
      user.generateToken();
      return await user.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e); //422
      }
      throw e;
    }
  }

  @UseGuards(AuthGuard('local'))
  @Post('sessions')
  async login(@Req() req: Request) {
    return { message: 'Correct', user: req.user };
  }

  @UseGuards(TokenAuthGuard)
  @Delete('sessions')
  async logout(@Req() req: Request){
    const headerValue = req.get('Authorization');
    if (!headerValue) return true;

    const [_bearer, token] = headerValue.split(' ');
    if (!token) return true;

    const user = await this.userModel.findOne({ token });

    if (!user) {
      return true;
    }
    user.generateToken();
    await user.save();
    return { message: 'Success' };
  }
}
