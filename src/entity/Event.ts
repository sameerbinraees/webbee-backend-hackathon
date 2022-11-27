import { Column, Entity, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  advanceBookingDays: number;

  @Column()
  duration: number; // in minutes

  // for any public holiday like christmas
  /* The reason for storing in event table is because its possible to have  
  a holiday for one kind of event, lets say 
  the whole team for a certain event is not available
  */
  @Column('timestamptz', { array: true })
  holidayDates: Date[];

  @Column()
  cleanUpBreak: number;
}
