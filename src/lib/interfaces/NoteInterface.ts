interface NoteObject {
    type: 'staccato' | 'legato' | 'continuous' | 'normal' | 'skip';
    note?: string;
    duration?: string; // Represents duration as string, e.g., "3" for 3 beats
}
