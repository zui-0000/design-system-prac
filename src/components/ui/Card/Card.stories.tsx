import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
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
    footer: <button type="button">詳しく見る</button>,
  },
};
