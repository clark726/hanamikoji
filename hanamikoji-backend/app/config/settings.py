from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """應用設定"""

    # 基本設定
    app_name: str = "花見小路遊戲"
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"

    # 資料庫設定
    database_url: str = "sqlite:///./data/hanamikoji.db"
    db_echo: bool = True
    
    # MongoDB設定
    mongodb_url: str = "mongodb://localhost:30017/hanamikoji_game"
    mongodb_db_name: str = "hanamikoji_game"

    # 安全設定
    secret_key: str = "dev-secret-key"

    class Config:
        env_file = ".env"
        case_sensitive = False


# 建立全域設定實例
settings = Settings()