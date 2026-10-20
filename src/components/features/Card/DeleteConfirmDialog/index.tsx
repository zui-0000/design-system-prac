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
import { Button } from "~/components/ui/Button/Button";

type DeleteConfirmDialogProps = {
  /** 削除するカード */
  card: CardData;
};

/**
 * カードを削除する前の確認。ui/AlertDialog を、カードの削除の文言で組み立てたもの（docs/19）。
 * 「削除」ボタンと、押すと開くダイアログをまとめて描く。消す処理もこの中に持つので、使う側はカードを渡すだけ
 */
export const DeleteConfirmDialog = ({ card }: DeleteConfirmDialogProps) => {
  const { deleteCard } = useCards();

  const handleDeleteCard = () => {
    deleteCard(card);
  };

  return (
    <AlertDialog trigger={<Button>削除</Button>}>
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
