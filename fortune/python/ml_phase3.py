#!/usr/bin/env python3
"""
Phase 3 머신러닝 분석
- 데이터셋 200+ 인물 로드
- 사주 → 특징 벡터 (오행분포·일간·일주·신살)
- Random Forest 분류기 (사주 → 직업)
- K-means 클러스터링 (60일주 그룹화)
- Cross-validation 정확도 검증
- Feature importance 분석
"""

import json
import math
import sys
import os
from collections import Counter
from pathlib import Path
from datetime import datetime, timezone, timedelta

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.model_selection import cross_val_score, StratifiedKFold, train_test_split
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.preprocessing import LabelEncoder
from sklearn.decomposition import PCA

# ===== 사주 계산 (saju.py 재사용) =====
sys.path.insert(0, str(Path(__file__).parent))
from saju import calculate_saju, CHEONGAN, JIJI, STEM_OHAENG, BRANCH_OHAENG

ROOT = Path(__file__).parent.parent

# ===== 데이터 로드 =====
print("=" * 75)
print("  Phase 3 머신러닝 분석 — Random Forest + K-means + Cross-Validation")
print("=" * 75)

with open(ROOT / "data/figures_dataset.json", encoding="utf-8") as f:
    dataset1 = json.load(f)
with open(ROOT / "data/figures_dataset_extended.json", encoding="utf-8") as f:
    dataset2 = json.load(f)

all_figures = dataset1["figures"] + dataset2["figures"]
print(f"\n[Step 1] 데이터셋 로드: {len(all_figures)}명")

# ===== 특징 벡터 생성 =====
HIDDEN_STEMS = [
    [9], [5, 9, 7], [0, 2, 4], [1], [4, 1, 9], [2, 4, 6],
    [3, 5], [5, 3, 1], [6, 8, 4], [7], [4, 7, 3], [8, 0],
]

def saju_to_features(year, month, day, hour, minute=0, gender="M"):
    """사주 → 다차원 특징 벡터"""
    try:
        if hour is None:
            hour = 12
        s = calculate_saju(year, month, day, hour, minute, gender,
                           longitude=127.0, use_true_solar_time=False)
    except Exception:
        return None

    feat = {}
    # 천간 4개 one-hot (총 40)
    for p in ["year", "month", "day", "hour"]:
        feat[f"{p}_stem"] = s[p]["stem"]
        feat[f"{p}_branch"] = s[p]["branch"]
    # 일간(가장 중요)
    feat["day_stem"] = s["day"]["stem"]
    # 오행 분포 (천간 + 본기, 8개 카운트)
    oh = {"목":0,"화":0,"토":0,"금":0,"수":0}
    for p in ["year","month","day","hour"]:
        oh[STEM_OHAENG[s[p]["stem"]]] += 1
        oh[BRANCH_OHAENG[s[p]["branch"]]] += 1
    for k in oh:
        feat[f"oh_{k}"] = oh[k]
    # 오행 균형도 (분산)
    vals = list(oh.values())
    feat["oh_var"] = float(np.var(vals))
    feat["oh_max"] = max(vals)
    feat["oh_min"] = min(vals)
    feat["oh_zero_count"] = sum(1 for v in vals if v == 0)
    # 일주 60갑자 인덱스
    feat["ilju_idx"] = s["day"]["stem"] * 12 + s["day"]["branch"]
    # 음양 (천간만 4개)
    yang_count = sum(1 for p in ["year","month","day","hour"] if s[p]["stem"] % 2 == 0)
    feat["yang_count"] = yang_count
    # 양력 월·날·시 (계절성)
    feat["birth_month"] = month
    feat["birth_hour"] = hour if hour is not None else 12
    # 성별
    feat["gender_M"] = 1 if gender == "M" else 0
    # 띠
    feat["animal_idx"] = s["year"]["branch"]
    return feat

# ===== 전체 데이터셋을 DataFrame으로 =====
print("[Step 2] 사주 → 특징 벡터 변환")
rows = []
labels = []
names = []
fame_levels = []

for f in all_figures:
    if not f.get("year") or f["year"] < 100:
        continue
    feat = saju_to_features(f["year"], f["month"], f["day"], f.get("hour"),
                             f.get("minute", 0), f.get("gender", "M"))
    if feat is None:
        continue
    cats = f.get("category", [])
    if not cats:
        continue
    primary_cat = cats[0]  # 첫 카테고리를 주 레이블
    rows.append(feat)
    labels.append(primary_cat)
    names.append(f["name"])
    fame_levels.append(f.get("fame", 3))

df = pd.DataFrame(rows)
print(f"  특징 행: {len(df)}, 특징 차원: {len(df.columns)}")
print(f"  카테고리 분포:")
for cat, cnt in Counter(labels).most_common():
    print(f"    {cat}: {cnt}명")

# ===== Random Forest 분류기 =====
print("\n[Step 3] Random Forest 분류기 학습 + Cross-Validation")
X = df.values
le = LabelEncoder()
y = le.fit_transform(labels)

# 5-fold cross-validation
clf = RandomForestClassifier(n_estimators=200, max_depth=12, random_state=42, n_jobs=-1, class_weight="balanced")
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

try:
    cv_scores = cross_val_score(clf, X, y, cv=skf, scoring="accuracy")
    print(f"  5-fold CV 정확도: {cv_scores.mean()*100:.1f}% (±{cv_scores.std()*100:.1f}%)")
    print(f"  랜덤 기대치: {100/len(set(labels)):.1f}%")
    print(f"  랜덤 대비: {cv_scores.mean()*100 / (100/len(set(labels))):.1f}배")
except Exception as e:
    print(f"  CV 오류(샘플 부족): {e}")
    print(f"  단일 fold만 실행")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    clf.fit(X_train, y_train)
    test_acc = clf.score(X_test, y_test)
    print(f"  Test 정확도: {test_acc*100:.1f}%")

# 전체 학습 (feature importance용)
clf.fit(X, y)

print("\n[Step 4] Feature Importance (어떤 사주 특징이 직업 분류에 가장 중요한가)")
importances = pd.DataFrame({"feature": df.columns, "importance": clf.feature_importances_})
importances = importances.sort_values("importance", ascending=False).head(15)
for _, row in importances.iterrows():
    bar = "█" * int(row["importance"] * 200)
    print(f"  {row['feature']:25} {row['importance']:.4f}  {bar}")

# ===== TOP-1, TOP-3 정확도 (전체 데이터 평가) =====
print("\n[Step 5] TOP-1, TOP-3 적중률 (전체 데이터, 자체 검증)")
proba = clf.predict_proba(X)
top1_correct = 0
top3_correct = 0
for i, true_label in enumerate(y):
    sorted_idx = np.argsort(proba[i])[::-1]
    if sorted_idx[0] == true_label:
        top1_correct += 1
    if true_label in sorted_idx[:3]:
        top3_correct += 1
print(f"  TOP-1: {top1_correct}/{len(y)} = {top1_correct/len(y)*100:.1f}%")
print(f"  TOP-3: {top3_correct}/{len(y)} = {top3_correct/len(y)*100:.1f}%")

# ===== K-means 클러스터링 =====
print("\n[Step 6] K-means 클러스터링 — 사주 8개 그룹 분류")
kmeans = KMeans(n_clusters=8, random_state=42, n_init=10)
clusters = kmeans.fit_predict(X)
df_cluster = pd.DataFrame({"name": names, "cluster": clusters, "label": labels, "fame": fame_levels})

print("  클러스터별 대표 인물 + 주된 직업:")
for cid in range(8):
    members = df_cluster[df_cluster["cluster"] == cid]
    top_jobs = Counter(members["label"]).most_common(3)
    famous = members.nlargest(5, "fame")["name"].tolist()
    print(f"\n  [Cluster {cid}] {len(members)}명")
    print(f"    주직업: {', '.join(f'{j}({c})' for j,c in top_jobs)}")
    print(f"    대표인물: {', '.join(famous[:5])}")

# ===== PCA 2D 시각화 (좌표만 저장) =====
print("\n[Step 7] PCA 2D 좌표 산출 (시각화 데이터)")
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)
print(f"  설명된 분산 비율: {pca.explained_variance_ratio_.sum()*100:.1f}%")

# 사용자 사주 좌표 추가
user1_feat = saju_to_features(1998, 11, 7, 7, 35, "M")
user2_feat = saju_to_features(1995, 6, 3, 8, 30, "M")
if user1_feat and user2_feat:
    user_X = np.array([list(user1_feat.values()), list(user2_feat.values())])
    user_pca = pca.transform(user_X)
    print(f"  최성훈 좌표: ({user_pca[0][0]:.2f}, {user_pca[0][1]:.2f})")
    print(f"  김건희 좌표: ({user_pca[1][0]:.2f}, {user_pca[1][1]:.2f})")
    print(f"  두 사람 거리: {np.linalg.norm(user_pca[0]-user_pca[1]):.2f}")

# ===== 사용자 사주의 가장 가까운 데이터셋 인물 =====
print("\n[Step 8] 사용자 사주의 가장 가까운 인물 (Cosine Similarity)")
from sklearn.metrics.pairwise import cosine_similarity

for user_name, user_input in [("최성훈", (1998, 11, 7, 7, 35, "M")),
                                ("김건희", (1995, 6, 3, 8, 30, "M"))]:
    feat = saju_to_features(*user_input)
    user_vec = np.array(list(feat.values())).reshape(1, -1)
    sims = cosine_similarity(user_vec, X)[0]
    top_idx = np.argsort(sims)[::-1][:7]
    print(f"\n  {user_name}님과 사주가 가장 비슷한 7명:")
    for idx in top_idx:
        print(f"    {sims[idx]:.4f}  {names[idx]:20}  ({labels[idx]})")

# ===== 사용자 직업 예측 =====
print("\n[Step 9] 사용자 사주 → 직업 예측 (Random Forest)")
for user_name, user_input in [("최성훈", (1998, 11, 7, 7, 35, "M")),
                                ("김건희", (1995, 6, 3, 8, 30, "M"))]:
    feat = saju_to_features(*user_input)
    user_vec = np.array(list(feat.values())).reshape(1, -1)
    proba = clf.predict_proba(user_vec)[0]
    top5 = np.argsort(proba)[::-1][:5]
    print(f"\n  {user_name}님 직업 카테고리 예측 TOP 5:")
    for rank, idx in enumerate(top5, 1):
        cat = le.inverse_transform([idx])[0]
        print(f"    {rank}. {cat:10} {proba[idx]*100:.1f}%")

# ===== 결과 JSON 저장 =====
output = {
    "dataset_size": len(df),
    "feature_dim": len(df.columns),
    "cv_accuracy": float(cv_scores.mean()) if 'cv_scores' in dir() else None,
    "cv_std": float(cv_scores.std()) if 'cv_scores' in dir() else None,
    "top1_self": top1_correct / len(y),
    "top3_self": top3_correct / len(y),
    "categories": dict(Counter(labels)),
    "top_features": [{"feature": str(r["feature"]), "importance": float(r["importance"])}
                      for _, r in importances.iterrows()],
    "clusters": [
        {"id": cid, "size": int(len(df_cluster[df_cluster["cluster"]==cid])),
         "top_jobs": Counter(df_cluster[df_cluster["cluster"]==cid]["label"]).most_common(3),
         "famous": df_cluster[df_cluster["cluster"]==cid].nlargest(5, "fame")["name"].tolist()}
        for cid in range(8)
    ],
    "user_predictions": {},
}

for user_name, user_input in [("최성훈", (1998, 11, 7, 7, 35, "M")),
                                ("김건희", (1995, 6, 3, 8, 30, "M"))]:
    feat = saju_to_features(*user_input)
    user_vec = np.array(list(feat.values())).reshape(1, -1)
    proba = clf.predict_proba(user_vec)[0]
    top5 = np.argsort(proba)[::-1][:5]
    output["user_predictions"][user_name] = [
        {"rank": rank, "category": str(le.inverse_transform([idx])[0]), "probability": float(proba[idx])}
        for rank, idx in enumerate(top5, 1)
    ]

(ROOT / "data/ml_phase3_results.json").write_text(json.dumps(output, ensure_ascii=False, indent=2))
print(f"\n[Done] 결과 저장: data/ml_phase3_results.json")
print("=" * 75)
