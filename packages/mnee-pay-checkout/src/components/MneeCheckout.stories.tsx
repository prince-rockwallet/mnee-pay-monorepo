import type { Meta, StoryObj } from '@storybook/react-vite';
import { MneeCheckout } from './MneeCheckout';

const meta = {
  title: 'Checkout/Flows',
  component: MneeCheckout,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'success' },
    onCancel: { action: 'cancelled' },
    onError: { action: 'error' },
  },
} satisfies Meta<typeof MneeCheckout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DonationFlow: Story = {
  args: {
    buttonId: '',
    apiBaseUrl: '',
  },
};
