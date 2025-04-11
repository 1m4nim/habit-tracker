//  習慣（Habit）の型を定義

export type Habit={
    id?:string; // FirestoreのドキュメントID（取得時のみ使用）
    title:string;// 習慣のタイトル（例: 「早起き」など）
    createdAt:Date;// 習慣の作成日時
    completedDates:string[]// 習慣を完了した日付（文字列形式 "YYYY-MM-DD"）
}
