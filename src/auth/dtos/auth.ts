import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class signUpDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  @Matches(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, {
    message: 'Telefone deve estar no formato (XX)XXXXX-XXXX',
  })
  phone: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class signinDTO {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
