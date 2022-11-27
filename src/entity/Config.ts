import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './Event';

@Entity()
export class Config {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.id)
  event: Event; // foreign key
  // eventId: string;

  @Column('enum', { enum: [1, 2, 3, 4, 5, 6] }) //  sundays off
  dayOfWeek: number;

  @Column('timestamptz')
  openingTime: Date;

  @Column('timestamptz')
  closingTime: Date;

  @Column('text', { array: true })
  workBreaks: String[];

  /* 
  given on a certain day of week, the clients influx can increase, 
  like on any weekend and we might have extra workforce on that day
  */
  @Column()
  totalClientsPerSlot: number;
}
