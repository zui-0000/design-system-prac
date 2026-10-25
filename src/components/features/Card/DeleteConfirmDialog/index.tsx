import { useCards } from "~/components/features/Card/hooks/useCards";
import type { CardData } from "~/components/features/Card/utils/cards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogActions,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogTitle,
} from "~/components/ui/AlertDialog/AlertDialog";

type DeleteConfirmDialogProps = {
  /** 削除するカード */
  card: CardData;
  /** 開いているか。メニューの「削除…」から開くので、開け閉めは使う側（CardActionsMenu）が持つ */
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * カードを削除する前の確認。ui/AlertDialog を、カードの削除の文言で組み立てたもの（docs/19）。
 * 開くボタンは持たない（カードのメニュー CardActionsMenu の「削除…」から開く、docs/21）。消す処理はこの中に持つ
 */
export const DeleteConfirmDialog = ({ card, open, onOpenChange }: DeleteConfirmDialogProps) => {
  const { deleteCard } = useCards();

  const handleDeleteCard = () => {
    deleteCard(card);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTitle>「{card.title}」を削除しますか？</AlertDialogTitle>
      <AlertDialogDescription>
        削除すると、元に戻せません。キャンセルすると、何も変わりません。
      </AlertDialogDescription>
      <AlertDialogActions>
        <AlertDialogCancel>キャンセル</AlertDialogCancel>
        <AlertDialogAction onClick={handleDeleteCard}>削除する</AlertDialogAction>
      </AlertDialogActions>
    </AlertDialog>
  );
};
