use color_eyre::eyre;

pub async fn translate(text: &str) -> color_eyre::Result<String> {
    let client = reqwest::Client::builder().build()?;

    let mut params = std::collections::HashMap::new();
    params.insert("text", text);
    params.insert("submit", "sauce");

    let request = client
        .request(reqwest::Method::POST, "https://osaka.uda2.com/")
        .form(&params);

    let response = request.send().await?;

    let body = response.text_with_charset("UTF-8").await?;

    let html = scraper::Html::parse_document(&body);

    let selector = scraper::Selector::parse("#translation").unwrap();
    if let Some(translation_element) = html.select(&selector).next() {
        let translated_text = String::from_iter(translation_element.text());
        Ok(translated_text)
    } else {
        eyre::bail!("Failed to translate")
    }
}

#[cfg(test)]
mod test {
    use super::translate;

    #[tokio::test]
    async fn translate_test() -> color_eyre::Result<()> {
        let text = translate("こんにちは").await?;
        println!("{text}");

        Ok(())
    }
}
