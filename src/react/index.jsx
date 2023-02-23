function Hello() {
  const world = "世界";
  return (
    <div>
      <Input placeholder="请输入" />
      你好{world}
    </div>
  );
}

// function Hello() {
//   const world = t('world');
//   return (
//     <div>
//       <Input placeholder={t('please-enter')} />{t('how-do-you-do')}{world}
//     </div>
//   );
// }
