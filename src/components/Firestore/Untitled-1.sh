
  curl "http://127.0.0.1:8081/v1/projects/demo-example/databases/gggg/documents/ggee?documentId=kek1" \
-H "Authorization: Bearer owner" \
-H "Content-Type: application/json" \
-X POST -d '{
  "fields": {
    "Name": {
      "stringValue": "Freshpak Rooibos Tea 80Pk"
    }
  }
}'


curl 'http://127.0.0.1:8081/v1/projects/demo-example/databases/gggg/documents:listCollectionIds' \
  -X 'POST' \
  -H 'Authorization: Bearer owner'

  curl 'http://127.0.0.1:8081/v1/projects/demo-example/databases/(default)/documents:listCollectionIds' \
  -X 'POST' \
  -H 'Authorization: Bearer owner'