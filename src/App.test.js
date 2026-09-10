import theme from './theme';

test('uses the Sharing the Message design system', () => {
  expect(theme.palette.primary.main).toBe('#153f3a');
  expect(theme.typography.button.textTransform).toBe('none');
});
