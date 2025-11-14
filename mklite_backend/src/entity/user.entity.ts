import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User { //user entity
    @PrimaryGeneratedColumn()
    ci: number;

    @Column()
    name: string;

    @Column()
    lastname: string;

    @Column()
    email: string;

    @Column()
    password: string;
}