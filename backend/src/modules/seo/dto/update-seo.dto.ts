import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSeoDto {
  @ApiProperty({ required: false, example: 'My Page Title — Site' })
  @IsOptional() @IsString() title?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() description?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional() @IsArray() keywords?: string[];

  @ApiProperty({ required: false })
  @IsOptional() @IsString() canonical?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() robots?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() ogTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() ogDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() ogImage?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() ogType?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() twitterCard?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() twitterTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() twitterDesc?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() twitterImage?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsObject() jsonLd?: Record<string, any>;
}
