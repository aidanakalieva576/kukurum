import pandas as pd
import json

# Загрузка parquet
df = pd.read_parquet("dialogues.parquet")
print("Исходных строк в файле:", len(df))
print("Колонки:", df.columns.tolist())

# Удалим дубликаты по колонкам Patient и Doctor
df = df.drop_duplicates(subset=["Patient", "Doctor"])
print("После удаления дубликатов:", len(df))

# Ограничим нужным диапазоном
# df = df.iloc[3400:3600]

# Запись в JSONL
with open("medical_data.jsonl", "a", encoding="utf-8") as f:
    for _, row in df.iterrows():
        if not pd.isna(row["Patient"]) and not pd.isna(row["Doctor"]):
            f.write(json.dumps({"role": "user", "content": row["Patient"]}, ensure_ascii=False) + "\n")
            f.write(json.dumps({"role": "assistant", "content": row["Doctor"]}, ensure_ascii=False) + "\n")

print("Файл успешно записан.")

