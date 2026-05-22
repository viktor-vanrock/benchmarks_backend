import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMetricDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name!: string;
}
