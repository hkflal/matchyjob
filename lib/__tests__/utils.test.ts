import {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  slugify,
  truncate,
  capitalize,
  isValidEmail,
  isValidPassword,
  getInitials,
  createQueryString,
} from '../utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
      expect(result).toBe('base-class conditional-class')
    })

    it('should resolve Tailwind conflicts', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })
  })

  describe('formatCurrency', () => {
    it('should format HKD currency correctly', () => {
      const result = formatCurrency(50000, 'HKD')
      expect(result).toBe('HK$50,000')
    })

    it('should default to HKD when currency not specified', () => {
      const result = formatCurrency(75000)
      expect(result).toBe('HK$75,000')
    })

    it('should handle USD currency', () => {
      const result = formatCurrency(60000, 'USD')
      expect(result).toBe('US$60,000')
    })

    it('should handle zero amount', () => {
      const result = formatCurrency(0)
      expect(result).toBe('HK$0')
    })
  })

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const date = '2025-08-22T10:30:00Z'
      const result = formatDate(date)
      expect(result).toMatch(/22 Aug 2025/)
    })

    it('should format Date object correctly', () => {
      const date = new Date('2025-08-22T10:30:00Z')
      const result = formatDate(date)
      expect(result).toMatch(/22 Aug 2025/)
    })

    it('should accept custom format options', () => {
      const date = '2025-08-22T10:30:00Z'
      const result = formatDate(date, { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      expect(result).toMatch(/Friday, 22 August 2025/)
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-08-22T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return "Just now" for recent times', () => {
      const recentTime = new Date('2025-08-22T11:59:30Z')
      const result = formatRelativeTime(recentTime)
      expect(result).toBe('Just now')
    })

    it('should return minutes for times within an hour', () => {
      const minutesAgo = new Date('2025-08-22T11:45:00Z')
      const result = formatRelativeTime(minutesAgo)
      expect(result).toBe('15m ago')
    })

    it('should return hours for times within a day', () => {
      const hoursAgo = new Date('2025-08-22T08:00:00Z')
      const result = formatRelativeTime(hoursAgo)
      expect(result).toBe('4h ago')
    })

    it('should return days for times within a week', () => {
      const daysAgo = new Date('2025-08-20T12:00:00Z')
      const result = formatRelativeTime(daysAgo)
      expect(result).toBe('2d ago')
    })
  })

  describe('slugify', () => {
    it('should convert text to URL-friendly slug', () => {
      const result = slugify('Software Engineer Position')
      expect(result).toBe('software-engineer-position')
    })

    it('should handle special characters', () => {
      const result = slugify('Full-Stack Developer (Remote)')
      expect(result).toBe('full-stack-developer-remote')
    })

    it('should handle multiple spaces', () => {
      const result = slugify('Senior   Frontend   Developer')
      expect(result).toBe('senior-frontend-developer')
    })
  })

  describe('truncate', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated'
      const result = truncate(longText, 20)
      expect(result).toBe('This is a very long...')
    })

    it('should return original text if shorter than limit', () => {
      const shortText = 'Short text'
      const result = truncate(shortText, 20)
      expect(result).toBe('Short text')
    })

    it('should handle empty string', () => {
      const result = truncate('', 10)
      expect(result).toBe('')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      const result = capitalize('hello world')
      expect(result).toBe('Hello world')
    })

    it('should handle single character', () => {
      const result = capitalize('a')
      expect(result).toBe('A')
    })

    it('should handle empty string', () => {
      const result = capitalize('')
      expect(result).toBe('')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email format', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email format', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should validate strong password', () => {
      expect(isValidPassword('SecurePass123')).toBe(true)
      expect(isValidPassword('MyPassword1')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(isValidPassword('password')).toBe(false) // No uppercase, no number
      expect(isValidPassword('PASSWORD')).toBe(false) // No lowercase, no number
      expect(isValidPassword('Password')).toBe(false) // No number
      expect(isValidPassword('Pass1')).toBe(false) // Too short
    })
  })

  describe('getInitials', () => {
    it('should extract initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Alice Bob Charlie')).toBe('AB')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('')
    })
  })

  describe('createQueryString', () => {
    it('should create query string from object', () => {
      const params = {
        search: 'software engineer',
        location: 'hong kong',
        page: 1
      }
      const result = createQueryString(params)
      expect(result).toBe('search=software+engineer&location=hong+kong&page=1')
    })

    it('should handle null and undefined values', () => {
      const params = {
        search: 'engineer',
        location: null,
        type: undefined,
        active: true
      }
      const result = createQueryString(params)
      expect(result).toBe('search=engineer&active=true')
    })

    it('should handle empty object', () => {
      const result = createQueryString({})
      expect(result).toBe('')
    })
  })
})