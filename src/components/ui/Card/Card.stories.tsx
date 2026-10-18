import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "~/components/ui/Button/Button";

import { Card } from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  decorators: [
    // Card は幅を持たないので、ストーリーでは置き場所の幅を決めて見る
    (Story) => (
      <div style={{ maxWidth: "24rem" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: "カードの見出し",
    children: "カードの本文。関係のある情報を 1 つの枠にまとめて見せる。",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooter: Story = {
  args: {
    footer: <Button>詳しく見る</Button>,
  },
};
