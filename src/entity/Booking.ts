import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
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

  @Column('enum', { enum: ['PENDING', 'COMPLETED'] })
  status: string;
}
