/**
 * ═══════════════════════════════════════════════════════
 * Toast Store Tests
 * ═══════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toastStore } from './toast.store';

describe('Toast Store', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    toastStore.clear();
    vi.useFakeTimers();
  });

  it('should add toast', () => {
    const toastId = toastStore.success('Test message');
    
    expect(toastId).toBeDefined();
    expect(typeof toastId).toBe('string');
  });

  it('should add success toast', () => {
    toastStore.success('Success!');
    
    // Get current toasts (need to subscribe)
    let toasts: any[] = [];
    const unsubscribe = toastStore.subscribe((t) => {
      toasts = t;
    });
    
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Success!');
    
    unsubscribe();
  });

  it('should add error toast', () => {
    toastStore.error('Error occurred!');
    
    let toasts: any[] = [];
    const unsubscribe = toastStore.subscribe((t) => {
      toasts = t;
    });
    
    expect(toasts[0].type).toBe('error');
    expect(toasts[0].message).toBe('Error occurred!');
    
    unsubscribe();
  });

  it('should add info toast', () => {
    toastStore.info('Info message');
    
    let toasts: any[] = [];
    const unsubscribe = toastStore.subscribe((t) => {
      toasts = t;
    });
    
    expect(toasts[0].type).toBe('info');
    
    unsubscribe();
  });

  it('should add warning toast', () => {
    toastStore.warning('Warning message');
    
    let toasts: any[] = [];
    const unsubscribe = toastStore.subscribe((t) => {
      toasts = t;
    });
    
    expect(toasts[0].type).toBe('warning');
    
    unsubscribe();
  });

  it('should remove toast by id', () => {
    const toastId = toastStore.success('Test');
    
    let toasts: any[] = [];
    const unsubscribe = toastStore.subscribe((t) => {
      toasts = t;
    });
    
    expect(toasts.length).toBe(1);
    
    toastStore.remove(toastId);
    expect(toasts.length).toBe(0);
    
    unsubscribe();
  });

  it('should clear all toasts', () => {
    toastStore.success('Test 1');
    toastStore.error('Test 2');
    toastStore.info('Test 3');
    
    let toasts: any[] = [];
    const unsubscribe = toastStore.subscribe((t) => {
      toasts = t;
    });
    
    expect(toasts.length).toBe(3);
    
    toastStore.clear();
    expect(toasts.length).toBe(0);
    
    unsubscribe();
  });

  it('should auto-remove toast after duration', () => {
    toastStore.success('Auto-remove', 1000);
    
    let toasts: any[] = [];
    const unsubscribe = toastStore.subscribe((t) => {
      toasts = t;
    });
    
    expect(toasts.length).toBe(1);
    
    // Fast-forward time
    vi.advanceTimersByTime(1001);
    
    // Toast should be removed
    expect(toasts.length).toBe(0);
    
    unsubscribe();
    vi.useRealTimers();
  });

  it('should not auto-remove toast if duration is 0', () => {
    toastStore.success('No auto-remove', 0);
    
    let toasts: any[] = [];
    const unsubscribe = toastStore.subscribe((t) => {
      toasts = t;
    });
    
    expect(toasts.length).toBe(1);
    
    vi.advanceTimersByTime(5000);
    
    // Toast should still be there
    expect(toasts.length).toBe(1);
    
    unsubscribe();
    vi.useRealTimers();
  });

  it('should handle multiple toasts', () => {
    toastStore.success('Success 1');
    toastStore.error('Error 1');
    toastStore.success('Success 2');
    
    let toasts: any[] = [];
    const unsubscribe = toastStore.subscribe((t) => {
      toasts = t;
    });
    
    expect(toasts.length).toBe(3);
    expect(toasts[0].message).toBe('Success 1');
    expect(toasts[1].message).toBe('Error 1');
    expect(toasts[2].message).toBe('Success 2');
    
    unsubscribe();
  });
});
