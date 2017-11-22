#!/bin/bash
if [ -z ${1+x} ]; then echo "Run with arguments: e.g. sh addTag.sh eap_7 \"EAP 7\""; fi
if [ -z ${2+x} ]; then echo "Run with arguments: e.g. sh addTag.sh eap_7 \"EAP 7\""; fi
lastLine=$(tail -1 _data/tags.yml)
if [ "$lastLine" != "" ]; then
echo -e "\n\n- slug: $1 \n  name: $2" >> _data/tags.yml
else 
echo -e "\n- slug: $1 \n  name: $2" >> _data/tags.yml
fi
sed -i -e "s/<\/ul>/    <li>\n        <a href=\"\/tags\/$1\">$2<\/a>\n    <\/li>\n<\/ul>/g" _includes/tags.html
cp blog/tags/cloud.html blog/tags/$1.html
sed -i "s/cloud/$1/g" blog/tags/$1.html
sed -i "s/Cloud/$2/g" blog/tags/$1.html
