import { CopyIcon, EllipsisIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { DeleteConfirmDialog } from "~/components/features/Card/DeleteConfirmDialog";
import { useCards } from "~/components/features/Card/hooks/useCards";
import type { CardData } from "~/components/features/Card/utils/cards";
import { Button } from "~/components/ui/Button/Button";
import { Menu, MenuItem, MenuSeparator } from "~/components/ui/Menu/Menu";

type CardActionsMenuProps = {
  /** 操作するカード */
  card: CardData;
};

/**
 * カードの操作のメニュー（「⋯」のボタン）。複製と削除をしまう（docs/21）。
 * 削除は取り消せないので、線で分けて一番下に置き、押すと確認ダイアログを開く。
 * 「削除…」の「…」は、押すとすぐ消えずに、続きの画面（確認）が出ることを示す
 */
export const CardActionsMenu = ({ card }: CardActionsMenuProps) => {
  const { duplicateCard } = useCards();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <Menu
        trigger={
          // アイコンだけのボタンなので、何のボタンかを aria-label で伝える
          <Button aria-label={`「${card.title}」の操作`}>
            <EllipsisIcon />
          </Button>
        }
      >
        <MenuItem onClick={() => duplicateCard(card)}>
          <CopyIcon />
          複製する
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant="danger" onClick={() => setDeleteDialogOpen(true)}>
          <Trash2Icon />
          削除…
        </MenuItem>
      </Menu>
      <DeleteConfirmDialog card={card} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
    </>
  );
};
