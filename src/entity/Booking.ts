import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsEmail } from 'class-validator';
import { Event } from './Event';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.id)
  event: Event; // foreign key
  // eventId: string;

  @Column('timestamptz')
  startTime: Date;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column('enum', { enum: ['PENDING', 'COMPLETED'] })
  status: string;
}
