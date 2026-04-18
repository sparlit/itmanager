/**
 * DUAL-CALENDAR UTILITY (GREGORIAN + HIJRI)
 * Based on the Umm al-Qura calendar (Standard for Saudi/Qatar).
 */
export class CalendarService {
  /**
   * Converts Gregorian Date to Hijri String (e.g., "1446-11-20")
   */
  static toHijri(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-u-ca-islamic-uma', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  /**
   * Formats a date in both calendars for UI display
   */
  static getDualDisplay(date: Date = new Date()): { gregorian: string, hijri: string } {
    return {
      gregorian: date.toLocaleDateString('en-GB'),
      hijri: this.toHijri(date)
    };
  }

  /**
   * Checks if today is within a major Islamic holiday (Ramadan/Eid)
   * Important for Sales & Marketing portals.
   */
  static isHolidayPeriod(date: Date = new Date()): { active: boolean, type?: string } {
    const hijri = this.toHijri(date);
    // Simple logic based on Hijri months: Month 9 = Ramadan, Month 10 = Eid al-Fitr, Month 12 = Eid al-Adha
    const month = parseInt(hijri.split('/')[1]);

    if (month === 9) return { active: true, type: 'RAMADAN' };
    if (month === 10) return { active: true, type: 'EID_AL_FITR' };
    if (month === 12) return { active: true, type: 'EID_AL_ADHA' };

    return { active: false };
  }
}
